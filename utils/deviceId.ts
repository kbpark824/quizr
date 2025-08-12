/*
 * Quizr - Daily Trivia App
 * Device identification utility for anonymous user tracking
 * Copyright 2025 Kibum Park
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { logger } from './logger';

const DEVICE_ID_KEY = 'quizr_device_id';

// Generate a simple UUID-like identifier
const generateDeviceId = (): string => {
  return 'device_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
};

// Get or create device ID
export const getDeviceId = async (): Promise<string> => {
  try {
    let deviceId = await AsyncStorage.getItem(DEVICE_ID_KEY);
    
    if (!deviceId) {
      deviceId = generateDeviceId();
      await AsyncStorage.setItem(DEVICE_ID_KEY, deviceId);
      logger.debug('Generated new device ID:', deviceId);
    } else {
      logger.debug('Retrieved existing device ID:', deviceId);
    }
    
    return deviceId;
  } catch (error) {
    logger.error('Error getting/setting device ID:', error);
    // Fallback to session-only ID
    return generateDeviceId();
  }
};