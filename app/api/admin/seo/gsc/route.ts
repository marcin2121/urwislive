import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { subDays, format } from 'date-fns';

export async function GET() {
  try {
    const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY;

    if (!clientEmail || !privateKey) {
      return NextResponse.json(
        { error: 'Brak kluczy dostępu Google API w środowisku.' },
        { status: 500 }
      );
    }

    // Initialize Google Auth client
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: clientEmail,
        // Some env handlers might escape the newline, we replace it just in case
        private_key: privateKey.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/webmasters.readonly'],
    });

    const searchconsole = google.webmasters({
      version: 'v3',
      auth: auth,
    });

    const siteUrl = 'https://www.sklep-urwis.pl/'; // Exact property URL as in GSC

    // Calculate dynamic dates (last 28 days vs previous 28 days to calculate trend)
    const today = new Date();
    // 3 days shifted because GSC data usually has a 2-3 day lag
    const endDate = format(subDays(today, 3), 'yyyy-MM-dd');
    const startDate = format(subDays(today, 31), 'yyyy-MM-dd'); // 28 days range

    // 1. Fetch Global Stats for the last 28 days
    const globalResponse = await searchconsole.searchanalytics.query({
      siteUrl: siteUrl,
      requestBody: {
        startDate: startDate,
        endDate: endDate,
        dimensions: ['date'], // Group by date to get sum
      },
    });

    const globalRows = globalResponse.data.rows || [];
    let totalClicks = 0;
    let totalImpressions = 0;
    let sumCtr = 0;
    let sumPosition = 0;

    if (globalRows.length > 0) {
      for (const row of globalRows) {
        totalClicks += row.clicks || 0;
        totalImpressions += row.impressions || 0;
        sumCtr += row.ctr || 0;
        sumPosition += row.position || 0;
      }
    }

    const avgCtr = globalRows.length > 0 ? (sumCtr / globalRows.length) * 100 : 0;
    const avgPosition = globalRows.length > 0 ? (sumPosition / globalRows.length) : 0;

    // 2. Fetch Top Queries
    const queriesResponse = await searchconsole.searchanalytics.query({
      siteUrl: siteUrl,
      requestBody: {
        startDate: startDate,
        endDate: endDate,
        dimensions: ['query'],
        rowLimit: 10,
        orderBy: [{ dimension: 'query' }], // We will sort manually anyway to get top
      },
    });

    let topQueries = queriesResponse.data.rows || [];
    topQueries = topQueries.sort((a, b) => (b.clicks || 0) - (a.clicks || 0));

    // Return structured payload
    return NextResponse.json({
      success: true,
      data: {
        dateRange: `${startDate} - ${endDate}`,
        stats: {
          clicks: totalClicks.toLocaleString('pl-PL'),
          impressions: totalImpressions > 1000 ? `${(totalImpressions / 1000).toFixed(1)}k` : totalImpressions.toLocaleString('pl-PL'),
          ctr: `${avgCtr.toFixed(1)}%`,
          position: avgPosition.toFixed(1),
        },
        queries: topQueries.map(q => ({
          query: q.keys ? q.keys[0] : 'Nieznana',
          clicks: q.clicks,
          impressions: q.impressions,
          position: q.position?.toFixed(1) || 0,
        }))
      }
    });

  } catch (error: any) {
    console.error('Błąd GSC API:', error);
    // Return friendly error allowing frontend fallback
    return NextResponse.json(
      { 
        error: 'Problem z autoryzacją Google API lub brak zweryfikowanej witryny w GSC.',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
