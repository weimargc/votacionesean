import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';

@Injectable({
  providedIn: 'root'
})
export class EncryptService {

  constructor() { }

  decryptUsingAES256(password: string): string {
    var KEY = "GglfQfNvIXhcwiwjcw7hTrMZnMYlJVCRKGv84VXE7MM="; // 32 bits
    var IV = "DHFvz/RI1baj2cM5tG3+kg=="; // 16 bits
    var key = CryptoJS.enc.Utf8.parse(KEY);
    var iv = CryptoJS.enc.Utf8.parse(IV);
    var encryptedHexStr = CryptoJS.enc.Hex.parse(password);
    var srcs = CryptoJS.enc.Base64.stringify(encryptedHexStr);
    var decrypt = CryptoJS.AES.decrypt(srcs, key, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });
    let decrypted = decrypt.toString(CryptoJS.enc.Utf8);
    console.log(decrypted);

    return decrypted.toString();
  }


}
