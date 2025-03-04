const { v4: uuidv4 } = require('uuid');

export function generate6DigitID() {
    const uuid = uuidv4().replace(/-/g, '');
    const num = parseInt(uuid.substring(0, 8), 16) % 1000000; // Use the first 8 hex characters
    return num.toString().padStart(6, '0');
  }