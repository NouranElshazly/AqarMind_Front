// src/utils/externalRef.js

/**
 * ExternalRef Utility - Idempotency Key Generator
 * Prevents duplicate operations (double clicks, retries, network failures)
 */

export function getOrCreateExternalRef(scope) {
  const { op, a, b } = scope;
  
  // Create unique storage key
  const key = `extref:${op}:${a}${b !== undefined ? `:${b}` : ""}`;
  
  // Check if already exists in localStorage
  const existing = localStorage.getItem(key);
  if (existing) {
    console.log(`[ExternalRef] Using existing ref for ${key}:`, existing);
    return existing;
  }
  
  const ref = `${op}-${a}${b !== undefined ? `-${b}` : ""}`;
  
  // Store it
  localStorage.setItem(key, ref);
  console.log(`[ExternalRef] Created new ref for ${key}:`, ref);
  
  return ref;
}

export function clearExternalRef(scope) {
  const { op, a, b } = scope;
  const key = `extref:${op}:${a}${b !== undefined ? `:${b}` : ""}`;
  
  localStorage.removeItem(key);
  console.log(`[ExternalRef] Cleared ref for ${key}`);
}

export function getExternalRef(scope) {
  const { op, a, b } = scope;
  const key = `extref:${op}:${a}${b !== undefined ? `:${b}` : ""}`;
  
  return localStorage.getItem(key);
}