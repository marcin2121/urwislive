import { test, expect } from '@playwright/test';

test.describe('Sklep Urwis - Główne ścieżki', () => {
  
  test('Powinien załadować stronę i przejść przez intro', async ({ page }) => {
    // 1. Wchodzi na stronę główną
    await page.goto('/');

    // 2. Obsługa Intro - szukamy przycisku "Pomiń animację"
    // Używamy .first(), ponieważ button jest wewnątrz AnimatePresence
    const skipIntroButton = page.getByRole('button', { name: /Pomiń animację/i });
    
    // Sprawdzamy czy przycisk się pojawił (może to zająć chwilę przez LoadingScreen)
    await expect(skipIntroButton).toBeVisible({ timeout: 15000 });
    await skipIntroButton.click();

    // 3. Po kliknięciu sprawdzamy, czy strona główna jest widoczna
    // (Intro ma scale i opacity transition, więc czekamy na stabilizację)
    await expect(page).toHaveTitle(/Urwis/i);
    const mainHeading = page.locator('h1').first();
    await expect(mainHeading).toBeVisible();
  });

  test('Powinien otworzyć modal logowania lub stronę profilu', async ({ page }) => {
    await page.goto('/');

    // Pomijamy intro również w tym teście, aby móc kliknąć w Navbar
    const skipIntroButton = page.getByRole('button', { name: /Pomiń animację/i });
    if (await skipIntroButton.isVisible({ timeout: 10000 })) {
      await skipIntroButton.click();
    }

    // Szukamy elementu wewnątrz <header>, który jest linkiem ("Profil") 
    // LUB przyciskiem ("Zaloguj"), ignorując wielkość liter.
    const profileOrLogin = page.locator('header').locator('button, a').filter({ 
      hasText: /Profil|Zaloguj/i 
    }).first();
    
    // Czekamy na widoczność (Navbar wysuwa się z góry)
    await expect(profileOrLogin).toBeVisible({ timeout: 10000 });
    await profileOrLogin.click();

    // Sprawdzamy czy jesteśmy w profilu lub widzimy modal
    const isLoginPage = page.url().includes('/profil');
    if (!isLoginPage) {
      const emailInput = page.getByPlaceholder(/Twój adres e-mail|Email/i);
      await expect(emailInput).toBeVisible();
    }
  });
});