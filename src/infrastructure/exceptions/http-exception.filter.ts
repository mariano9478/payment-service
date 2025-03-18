import { Catch, ExceptionFilter } from "@nestjs/common";

@Catch()
export default class HttpExceptionFilter implements ExceptionFilter<Error> {
  catch() {}

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public isBusinessException(): any {}
}
