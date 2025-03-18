// src/decorators/validate-status.decorator.ts

import { IPaymentProvider } from "../payment.interface";

export function AuthValidation() {
  return function (
    target: unknown,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value as (...args: unknown[]) => unknown;

    descriptor.value = async function (...args: unknown[]) {
      if (!(this as IPaymentProvider).authenticated) {
        throw new Error("The paymet provider is not authenticated");
      }
      return await originalMethod.apply(this, args);
    };

    return descriptor;
  };
}
