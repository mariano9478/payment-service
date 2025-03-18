import crypto from "node:crypto";

import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import { Inject } from "@nestjs/common";
import { Cache } from "cache-manager";
import { Observable, of } from "rxjs";
import { tap } from "rxjs/operators";

@Injectable()
export class CacheResponseInterceptor implements NestInterceptor {
  constructor(@Inject("CACHE_MANAGER") private cacheManager: Cache) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<unknown>> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const request = context.switchToHttp().getRequest();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const cacheKey = this.generateCacheKey(request);
    // Verificar si la respuesta ya está en caché
    const cachedResponse = await this.cacheManager.get(cacheKey);
    if (cachedResponse) {
      return of({
        message: "cached",
        ...cachedResponse,
      });
    }

    return next.handle().pipe(
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      tap(async response => {
        await this.cacheManager.set(cacheKey, response, 10_000); // Caché por 10 segundos
      }),
    );
  }

  private generateCacheKey(request: {
    method: string;
    url: string;
    body: Record<string, unknown>;
    query: Record<string, unknown>;
  }): string {
    const { method, url, body, query } = request;

    // Normaliza la URL eliminando valores dinámicos de parámetros
    const normalizedPath = url.replaceAll(/\/\d+/g, "/:id"); // Reemplaza números por ':id'

    // Generar un hash con el contenido relevante
    const hash = crypto
      .createHash("md5")
      .update(
        method + normalizedPath + JSON.stringify(query) + JSON.stringify(body),
      )
      .digest("hex");

    return `cache:${hash}`;
  }
}
