import '@testing-library/jest-dom/vitest'

HTMLElement.prototype.scrollIntoView = HTMLElement.prototype.scrollIntoView ?? (() => {})
