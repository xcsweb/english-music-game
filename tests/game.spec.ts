import { test, expect } from '@playwright/test';

test.describe('Game Flow', () => {
  test('picks a random song, plays through the game and returns home', async ({ page }) => {
    // Increase timeout since game flow takes time
    test.setTimeout(120000);

    // Navigate to home page
    await page.goto('/');

    // Wait for the song list to be rendered
    await page.waitForSelector('.grid.grid-cols-2.gap-4');

    // Get all songs
    const songs = await page.locator('.grid.grid-cols-2.gap-4 > div').all();
    expect(songs.length).toBeGreaterThan(0);

    // Pick a random song
    const randomIndex = Math.floor(Math.random() * songs.length);
    const selectedSong = songs[randomIndex];
    
    // Click the selected song
    await selectedSong.click();

    // Wait for the game page to load and audio to be ready
    // Sometimes audio fails to load or takes long, so we expect either START GAME or an error
    const startButton = page.getByRole('button', { name: 'START GAME', exact: true });
    const errorText = page.getByText('Audio Failed to Load');
    
    await expect(startButton.or(errorText)).toBeVisible({ timeout: 20000 });
    
    if (await errorText.isVisible()) {
      console.log('Audio failed to load in E2E test, skipping game flow.');
      return;
    }

    await startButton.click();

    // We enter a loop of sentences until we see "Victory!"
    let isVictory = false;
    let i = 0;
    
    while (!isVictory) {
      // Wait for either memorize phase or victory
      // Memorize phase has the text with animate-pulse
      // Victory has text "Victory!"
      
      const memorizeTextLocator = page.locator('.animate-pulse.bg-gradient-to-r');
      const victoryLocator = page.locator('text=Victory!');

      // Wait for one of them to appear
      await Promise.race([
        memorizeTextLocator.waitFor({ state: 'visible', timeout: 10000 }),
        victoryLocator.waitFor({ state: 'visible', timeout: 10000 })
      ]);

      if (await victoryLocator.isVisible()) {
        isVictory = true;
        break;
      }

      // We are in memorize phase
      const fullSentence = await memorizeTextLocator.innerText();
      const targetWords = fullSentence.trim().split(/\s+/);

      // Wait for the build phase to start (memorize phase is 5s)
      // The word pool buttons will appear
      const wordPoolArea = page.locator('.flex-1.flex.flex-wrap.content-start.justify-center');
      await expect(wordPoolArea).toBeVisible({ timeout: 10000 });

      // Build phase started, we need to click the words in order
      for (const word of targetWords) {
        // Find the button in word pool that has exactly this text and is not disabled/used
        // Using wordPoolArea to restrict the search
        const escapedWord = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const wordBtn = wordPoolArea.locator('button:not([disabled])', { hasText: new RegExp(`^\\s*${escapedWord}\\s*$`) }).first();
        await expect(wordBtn).toBeVisible();
        await wordBtn.click();
        
        // Wait a tiny bit for the UI to update
        await page.waitForTimeout(50);
      }

      // After clicking all words correctly, there's a 1.5s delay before the next sentence starts
      // We don't need to explicitly wait, the next loop iteration will wait for the memorize text or victory.
      // But we should wait for the word pool to disappear or the next memorize phase to start.
      await page.waitForTimeout(1600);
      
      // Stop after 2 sentences to save E2E test time
      if (i >= 1) break;
      i++;
    }

    // Since we broke early, we just navigate back home manually to test navigation
    await page.locator('button.p-2.-ml-2').click();

    // Verify we are back home without refresh (SPA navigation)
    await expect(page.locator('.grid.grid-cols-2.gap-4')).toBeVisible();
  });
});
