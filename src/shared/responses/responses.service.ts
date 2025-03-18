import { HttpException, HttpStatus, Injectable } from "@nestjs/common";

@Injectable()
export default class ResponsesService {
  constructor() {}

  error(error: unknown, message: string): HttpException {
    if (
      error instanceof Error &&
      typeof error === "object" &&
      error !== null &&
      "message" in error
    ) {
      return new HttpException(
        { message: message, error: error.message },
        HttpStatus.BAD_REQUEST,
      );
    }

    return new HttpException({ message: message }, HttpStatus.BAD_REQUEST);
  }
}
