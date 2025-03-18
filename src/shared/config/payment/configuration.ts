import { registerAs } from "@nestjs/config";

export default registerAs("payment", () => ({
  is_local: process.env.PAYMENT_IS_LOCAL,
  LAWPAY: {
    TEST_TENANT: {
      client_id: process.env.ST_LAWPAY_CLIENT_ID,
      client_secret: process.env.ST_LAWPAY_CLIENT_SECRET,
      secret: process.env.ST_LAWPAY_SECRET,
      ACCOUNT_CARD: process.env.ST_LAWPAY_ACCOUNT_CARD,
      ACCOUNT_BANK: process.env.ST_LAWPAY_ACCOUNT_BANK,
    },
  },
}));
