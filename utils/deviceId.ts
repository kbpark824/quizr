/*
 * Quizr - Daily Trivia App
 * Device identification utility for anonymous user tracking
 * Copyright (C) 2025  Kibum Park
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
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