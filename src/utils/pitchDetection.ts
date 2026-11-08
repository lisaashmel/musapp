// Autocorrelation-based pitch detection (YIN-like algorithm)
export function autoCorrelate(buffer: Float32Array, sampleRate: number): number {
  const SIZE = buffer.length;
  const MAX_SAMPLES = Math.floor(SIZE / 2);
  let bestOffset = -1;
  let bestCorrelation = 0;
  let rms = 0;
  let foundGoodCorrelation = false;

  // Calculate RMS
  for (let i = 0; i < SIZE; i++) {
    const val = buffer[i];
    rms += val * val;
  }
  rms = Math.sqrt(rms / SIZE);

  // If signal is too quiet, return -1
  if (rms < 0.01) return -1;

  let lastCorrelation = 1;

  for (let offset = 0; offset < MAX_SAMPLES; offset++) {
    let correlation = 0;

    for (let i = 0; i < MAX_SAMPLES; i++) {
      correlation += Math.abs(buffer[i] - buffer[i + offset]);
    }

    correlation = 1 - correlation / MAX_SAMPLES;

    if (correlation > 0.9 && correlation > lastCorrelation) {
      foundGoodCorrelation = true;
      if (correlation > bestCorrelation) {
        bestCorrelation = correlation;
        bestOffset = offset;
      }
    } else if (foundGoodCorrelation) {
      // Short-circuit - we found a good correlation
      const shift =
        (buffer[bestOffset + 1] - buffer[bestOffset - 1]) / buffer[bestOffset];
      return sampleRate / (bestOffset + 8 * shift);
    }

    lastCorrelation = correlation;
  }

  if (bestCorrelation > 0.01) {
    return sampleRate / bestOffset;
  }

  return -1;
}

// Alternative: YIN algorithm for better pitch detection
export function yinPitchDetection(
  buffer: Float32Array,
  sampleRate: number,
  threshold: number = 0.15
): number {
  const bufferSize = buffer.length;
  const tauEstimate = -1;
  const yinBufferLength = Math.floor(bufferSize / 2);
  const yinBuffer = new Float32Array(yinBufferLength);

  // Step 2: Difference function
  for (let tau = 0; tau < yinBufferLength; tau++) {
    yinBuffer[tau] = 0;
    for (let i = 0; i < yinBufferLength; i++) {
      const delta = buffer[i] - buffer[i + tau];
      yinBuffer[tau] += delta * delta;
    }
  }

  // Step 3: Cumulative mean normalized difference function
  yinBuffer[0] = 1;
  let runningSum = 0;
  for (let tau = 1; tau < yinBufferLength; tau++) {
    runningSum += yinBuffer[tau];
    yinBuffer[tau] *= tau / runningSum;
  }

  // Step 4: Absolute threshold
  let tau;
  for (tau = 2; tau < yinBufferLength; tau++) {
    if (yinBuffer[tau] < threshold) {
      while (tau + 1 < yinBufferLength && yinBuffer[tau + 1] < yinBuffer[tau]) {
        tau++;
      }
      break;
    }
  }

  if (tau === yinBufferLength || yinBuffer[tau] >= threshold) {
    return -1;
  }

  // Step 5: Parabolic interpolation
  let betterTau;
  const x0 = tau < 1 ? tau : tau - 1;
  const x2 = tau + 1 < yinBufferLength ? tau + 1 : tau;

  if (x0 === tau) {
    betterTau = yinBuffer[tau] <= yinBuffer[x2] ? tau : x2;
  } else if (x2 === tau) {
    betterTau = yinBuffer[tau] <= yinBuffer[x0] ? tau : x0;
  } else {
    const s0 = yinBuffer[x0];
    const s1 = yinBuffer[tau];
    const s2 = yinBuffer[x2];
    betterTau = tau + (s2 - s0) / (2 * (2 * s1 - s2 - s0));
  }

  return sampleRate / betterTau;
}

// Smooth frequency to avoid jitter
export function smoothFrequency(
  currentFreq: number,
  previousFreq: number,
  smoothing: number = 0.8
): number {
  if (previousFreq < 0) return currentFreq;
  return previousFreq * smoothing + currentFreq * (1 - smoothing);
}

// Check if frequency is in valid range for musical instruments
export function isValidFrequency(freq: number): boolean {
  return freq >= 60 && freq <= 2100; // C2 to C7 approximately
}
