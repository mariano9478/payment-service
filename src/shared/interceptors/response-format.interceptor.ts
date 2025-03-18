import {
  CallHandler,
  ExecutionContext,
  HttpException,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import { Observable, throwError } from "rxjs";
import { catchError, map } from "rxjs/operators";

import { ResponseDto } from "@src/domain/dtos/out/response.dto";

@Injectable()
export class ResponseFormatInterceptor<T>
  implements NestInterceptor<T, ResponseDto<T>>
{
  constructor() {}

  intercept(
    _context: ExecutionContext,
    next: CallHandler,
  ): Observable<ResponseDto<T>> {
    return next.handle().pipe(
      map((data: T) => new ResponseDto(data).toSuccess()),
      catchError((error: HttpException) => {
        return throwError(() => new ResponseDto<T>().toError(error));
      }),
    );
  }
}
