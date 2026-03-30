import webpush from 'web-push';
import { createClient } from '@/lib/supabase/server';
import { initWebPush } from '@/lib/push-server';
import { ROUTES } from '@/lib/routes';
import { SendPushInput, SendAllPushInput } from '@/lib/validations/push';

/**
 * Service for managing Web Push notifications.
 * Handles individual sends, broadcasts, and subscription cleanup.
 */
export class PushService {
  /**
   * Send a notification to a specific subscription.
   * 
   * @param input Validated subscription and message data
   */
  static async sendNotification(input: SendPushInput): Promise<void> {
    const isPushReady = initWebPush();
    if (!isPushReady) {
      throw new Error('Push service is not configured (missing VAPID keys).');
    }

    const payload = JSON.stringify({
      title: input.title,
      body: input.message,
      icon: '/android-chrome-192x192.png',
      badge: '/favicon-16x16.png',
      data: {
        url: ROUTES.HOME
      }
    });

    try {
      await webpush.sendNotification(input.subscription, payload);
    } catch (error) {
      console.error('[PushService] Error sending to subscription:', error);
      throw new Error('Failed to send push notification.');
    }
  }

  /**
   * Broadcast a notification to multiple subscribers based on topics.
   * Cleans up expired/invalid subscriptions automatically.
   * 
   * @param input Broadcast configuration
   */
  static async broadcast(input: SendAllPushInput): Promise<{ count: number; category: string }> {
    const { title, message, image, topic } = input;
    
    const supabase = await createClient();
    if (!supabase) {
      throw new Error('Database connection failed.');
    }

    // 1. Fetch subscriptions filtered by topic
    let query = supabase.from('push_subscriptions').select('endpoint, subscription_data');
    
    if (topic && topic !== 'wszystkie') {
      // Postgres JSONB check: topics array contains the requested topic OR 'wszystkie'
      query = query.or(`topics.cs.{"${topic}"},topics.cs.{"wszystkie"}`);
    }

    const { data: subs, error: fetchError } = await query;

    if (fetchError || !subs) {
      console.error('[PushService] Fetch subscriptions error:', fetchError);
      throw new Error('Could not retrieve subscribers.');
    }

    if (subs.length === 0) {
      return { count: 0, category: topic || 'wszystkie' };
    }

    // 2. Prepare payload and send concurrently
    const payload = JSON.stringify({
      title,
      body: message,
      image,
      icon: '/android-chrome-192x192.png',
      badge: '/favicon-16x16.png',
      data: {
        url: `${ROUTES.HOME}?utm_source=push&utm_campaign=broadcast_${topic || 'all'}`
      }
    });

    initWebPush();

    const notifications = subs.map((sub: { endpoint: string, subscription_data: any }) => 
      webpush.sendNotification(sub.subscription_data as webpush.PushSubscription, payload).catch(async (err) => {
        // If 410 (Gone) or 404 (Not Found), the subscription is no longer valid
        if (err.statusCode === 410 || err.statusCode === 404) {
          await supabase
            .from('push_subscriptions')
            .delete()
            .eq('endpoint', sub.endpoint);
        }
      })
    );

    await Promise.all(notifications);

    // 3. Log History
    await supabase.from('push_history').insert([{
      title,
      message,
      image_url: image || null,
      topic: topic || 'wszystkie',
      sent_to_count: subs.length,
      status: 'sent'
    }]);

    return { 
      count: subs.length, 
      category: topic || 'wszystkie' 
    };
  }

  /**
   * Track a notification interaction.
   */
  static async trackInteraction(action: string, url: string): Promise<void> {
    const supabase = await createClient();
    if (!supabase) return;

    const { error } = await supabase.from('push_analytics').insert([{ action, url }]);
    if (error) {
      console.error('[PushService/Track] DB Error:', error);
    }
  }

  /**
   * Send a welcome notification.
   */
  static async sendWelcomeNotification(subscription: webpush.PushSubscription): Promise<void> {
    const payload = JSON.stringify({
      title: 'Przybita piątka! Urwis melduje się 🐾',
      body: 'Kliknij i wybierz: Sklep czy Sala Zabaw! 🐾',
      icon: '/android-chrome-192x192.png',
      badge: '/android-chrome-192x192.png',
      data: {
        url: '/?settings=open'
      }
    });

    initWebPush();
    await webpush.sendNotification(subscription, payload);
  }
}
