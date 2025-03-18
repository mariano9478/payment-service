import { HttpException, HttpStatus } from "@nestjs/common";
import { ApiProperty } from "@nestjs/swagger";

export class ResponseDto<T> {
  public data?: T;
  @ApiProperty({
    type: String,
    example: "Example Error",
  })
  public message!: string;
  @ApiProperty({
    type: Object,
    example: {
      message: "Example Error",
      error: "Example Error",
      statusCode: 400,
    },
  })
  public error!: string | object;

  constructor(data?: T) {
    this.data = data;
  }

  toSuccess(): ResponseDto<T> {
    this.message = "success";

    if (
      this.data instanceof Object &&
      "message" in this.data &&
      this.data.message
    ) {
      // eslint-disable-next-line @typescript-eslint/no-base-to-string
      this.message = this.data.message.toString();

      delete this.data.message;
    }

    return this;
  }

  toError(error: HttpException): HttpException {
    this.data = undefined;
    this.message = error.message;
    if (error instanceof HttpException) {
      this.error =
        error.getResponse() === this.message ? error.name : error.getResponse();
      return new HttpException(this, error.getStatus());
    } else {
      this.error = {
        message: "Unexpected error occurred",
        error: "Internal server error",
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      };
      return new HttpException(this, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
