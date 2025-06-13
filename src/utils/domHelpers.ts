export class DOMHelpers {
  static findElement(selectors: string[]): Element | null {
    for (const selector of selectors) {
      try {
        const element = document.querySelector(selector);
        if (element) return element;
      } catch (e) {
        // Invalid selector, try next
      }
    }
    return null;
  }

  static findAllElements(selectors: string[]): Element[] {
    const elements: Element[] = [];
    for (const selector of selectors) {
      try {
        elements.push(...Array.from(document.querySelectorAll(selector)));
      } catch (e) {
        // Invalid selector, continue
      }
    }
    return elements;
  }

  static extractText(element: Element | null, fallback = ''): string {
    return element?.textContent?.trim() || fallback;
  }

  static extractNumber(text: string): number {
    const match = text.match(/\d+/);
    return match ? parseInt(match[0]) : 0;
  }

  static extractCurrency(text: string): number {
    const match = text.match(/\$(\d+(?:,\d{3})*(?:\.\d{2})?)/);
    if (!match) return 0;
    return parseFloat(match[1].replace(/,/g, ''));
  }

  static waitForElement(selector: string, timeout = 10000): Promise<Element> {
    return new Promise((resolve, reject) => {
      const element = document.querySelector(selector);
      if (element) {
        resolve(element);
        return;
      }

      const observer = new MutationObserver((_, obs) => {
        const element = document.querySelector(selector);
        if (element) {
          obs.disconnect();
          resolve(element);
        }
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true
      });

      setTimeout(() => {
        observer.disconnect();
        reject(new Error(`Element ${selector} not found within ${timeout}ms`));
      }, timeout);
    });
  }
}

