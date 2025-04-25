import * as crypto from 'crypto';

export class VNPayUtils {
  static createPaymentUrl({
    vnpayTmnCode,
    vnpayHashSecret,
    vnpayUrl,
    orderId,
    amount,
    ipAddr,
    returnUrl,
    orderInfo = 'Thanh toan don hang',
    createDate = new Date(),
  }: {
    vnpayTmnCode: string;
    vnpayHashSecret: string;
    vnpayUrl: string;
    orderId: string;
    amount: number;
    ipAddr: string;
    returnUrl: string;
    orderInfo?: string;
    createDate?: Date;
  }): string {
    const vnpParams: { [key: string]: string | number } = {
      vnp_Version: '2.1.0',
      vnp_Command: 'pay',
      vnp_TmnCode: vnpayTmnCode,
      vnp_Amount: amount * 100,
      vnp_CreateDate: this.formatDate(createDate),
      vnp_CurrCode: 'VND',
      vnp_IpAddr: ipAddr,
      vnp_Locale: 'vn',
      vnp_OrderInfo: orderInfo,
      vnp_OrderType: '250000',
      vnp_ReturnUrl: returnUrl,
      vnp_TxnRef: orderId,
    };

    const sortedParams = this.sortObject(vnpParams);
    const signData = Object.keys(sortedParams)
      .map(
        key =>
          `${key}=${encodeURIComponent(sortedParams[key]).replace(/%20/g, '+')}`
      )
      .join('&');

    const hmac = crypto.createHmac('sha512', vnpayHashSecret);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
    vnpParams['vnp_SecureHash'] = signed;

    const queryString = Object.keys(vnpParams)
      .map(
        key =>
          `${key}=${encodeURIComponent(vnpParams[key]).replace(/%20/g, '+')}`
      )
      .join('&');

    return `${vnpayUrl}?${queryString}`;
  }

  static verifyReturnUrl({
    vnpayHashSecret,
    query,
  }: {
    vnpayHashSecret: string;
    query: { [key: string]: string };
  }): boolean {
    const secureHash = query['vnp_SecureHash'];
    delete query['vnp_SecureHash'];
    delete query['vnp_SecureHashType'];

    const sortedParams = this.sortObject(query);
    const signData = Object.keys(sortedParams)
      .map(
        key =>
          `${key}=${encodeURIComponent(sortedParams[key]).replace(/%20/g, '+')}`
      )
      .join('&');

    const hmac = crypto.createHmac('sha512', vnpayHashSecret);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

    return secureHash === signed;
  }

  private static sortObject(obj: { [key: string]: any }): {
    [key: string]: any;
  } {
    const sorted: { [key: string]: any } = {};
    const keys = Object.keys(obj).sort();
    for (const key of keys) {
      sorted[key] = obj[key];
    }
    return sorted;
  }

  private static formatDate(date: Date): string {
    return date.toISOString().replace(/[-:T]/g, '').slice(0, 14);
  }
}
