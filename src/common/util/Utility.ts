import * as dotenv from 'dotenv';
import axios, { AxiosRequestConfig } from 'axios';
import { Request, Response, NextFunction } from 'express';
import * as CryptoJS from 'crypto-js';
import { returnError } from './response.handler';

// Load environment variables at the very beginning
dotenv.config();

const PROJECT_NAME_ENCRYPTION_KEY = process.env.PROJECT_NAME_ENCRYPTION_KEY;
const encryption_key = `${PROJECT_NAME_ENCRYPTION_KEY}`;

export async function callApi(api: string, method: string, body: any, headers?: any, params?: any): Promise<any> {
  try {
    headers = {appId: process.env.APP_ID, apiKey: new Date().getTime()};
    console.log("headers-------", headers)
    const config: AxiosRequestConfig = {
      headers,
      params
    };
    let response: any;

    switch (method.toUpperCase()) {
      case 'GET':
        response = await axios.get(api, config);
        break;
      case 'POST':
        response = await axios.post(api, body, config);
        break;
      default:
        throw new Error(`Unsupported HTTP method: ${method}`);
    }
    if (response.status !== 400 || response.status !== 500) {
      return response.data;
    } else {
      // Handle other non-200 status codes here
      console.error(`Service B API returned status code ${response.status}`);
      return { error: true, message: 'API Error' };
    }
  } catch (error) {
    console.error('Error callWalletServiceApi: ', error);
    throw error;
  }
}

export const encryptData = async (data: any) => {
  try {
    // Encrypt
    const key: any = await getKey(50);
    const cipherText: any = CryptoJS.AES.encrypt(data, key).toString();
    return cipherText;
  } catch (error) {
    return returnError(true, 'Invalid body data.');
  }
};

export const decryptData = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (process.env.ENCRYPTION === 'true') {
      // req.method == POST
      const token = req?.body?.reqData;
      if (!req?.body.length != undefined && req.method !== 'GET') {
        const key: any = await getKey(50);
        const bytes = CryptoJS.AES.decrypt(token, key);
        const originalText = bytes.toString(CryptoJS.enc.Utf8);
        if (!originalText) {
          throw originalText;
        }
        console.log('originalText == ', originalText); // 'my message'
        req.body = JSON.parse(originalText);
        next();
      } else {
        //   const encData: any = await encryptBody(
        //     JSON.stringify(returnError(true, INVALID_BODY_TOKEN))
        //   );
        //   res.status(400).send({ resData: encData });
        // return returnError(true, INVALID_BODY_TOKEN);
        next();
      }
    } else {
      next();
    }
  } catch (error) {
    const encData: any = await encryptData(
      JSON.stringify(returnError(true, 'Invalid body data.'))
    );
    res.status(400).send({ resData: encData });
  }
};

function seededShuffle(array: any[], seed: number): any[] {
  let currentIndex = array.length;
  const random = () => {
    seed = (seed * 9301 + 49297) % 233280; // Deterministic seed-based random generator
    return seed / 233280;
  };
  while (currentIndex !== 0) {
    const randomIndex = Math.floor(random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }
  return array;
}

function isPrime(number: number): boolean {
  if (number <= 1) return false;
  if (number <= 3) return true;
  if (number % 2 === 0 || number % 3 === 0) return false;

  for (let i = 5; i * i <= number; i += 6) {
    if (number % i === 0 || number % (i + 2) === 0) return false;
  }

  return true;
}

function getPrimeNumbersInRange(start: number, end: number): number[] {
  const primeNumbers = [];
  for (let number = start; number <= end; number++) {
    if (isPrime(number)) {
      primeNumbers.push(number);
    }
  }
  return primeNumbers;
}

function applyCaesarCipher(text: string, shift: number): string {
  return text
    .split("")
    .map((char) => {
      const code = char.charCodeAt(0);
      if (code >= 65 && code <= 90) {
        // Uppercase letters
        return String.fromCharCode(((code - 65 + shift) % 26) + 65);
      } else if (code >= 97 && code <= 122) {
        // Lowercase letters
        return String.fromCharCode(((code - 97 + shift) % 26) + 97);
      }
      return char; // Non-alphabetic characters remain the same
    })
    .join("");
}

export function getKey(value: number): string {
  const key = encryption_key;

  // Step 1: Get prime numbers in range
  const primeNumbers = getPrimeNumbersInRange(1, value);

  // Step 2: Shuffle prime numbers using a deterministic seed
  const seed = value; // Using `value` as the seed for deterministic behavior
  const shuffledPrimes = seededShuffle([...primeNumbers], seed);

  // Step 3: Calculate a checksum from shuffled primes
  const checksum = shuffledPrimes.reduce((sum, num) => sum + num, 0);

  // Step 4: Map primes to characters in the key
  const mappedString = shuffledPrimes
    .map((prime) => key[prime % key.length] || "") // Handle case where prime exceeds key length
    .join("");

  // Step 5: Apply Caesar cipher with checksum as shift
  const finalSecret = applyCaesarCipher(mappedString, checksum % 26);
  return finalSecret;
}

/*const isPrime = async (number: number) => {
  if (number <= 1) {
    return false;
  }
  if (number <= 3) {
    return true;
  }
  if (number % 2 === 0 || number % 3 === 0) {
    return false;
  }
  for (let i = 5; i * i <= number; i += 6) {
    if (number % i === 0 || number % (i + 2) === 0) {
      return false;
    }
  }
  return true;
};

const getPrimeNumbersInRange = async (start: number, end: number) => {
  const primeNumbers = [];

  for (let number = start; number <= end; number++) {
    if (await isPrime(number)) {
      primeNumbers.push(number);
    }
  }
  return primeNumbers;
};

const getKey = async (value: number) => {
  const key = encryption_key;
  // get the prime number
  const primeNumbers: any = await getPrimeNumbersInRange(1, value);
  // get the string according to the prime number
  const string = primeNumbers.map((number: number) => key[number]).join('');
  return string;
}; */
