export abstract class Trip<P, Q, B> {
  isSubmitting = false
  isSubmitted = false
  protected params?: P
  protected query?: Q
  protected body?: B

  setParams(params: P) {
    this.params = params
  }

  setQuery(query: Q) {
    this.query = query
  }

  setBody(body: B) {
    this.body = body
  }

  protected abstract exec(params?: P, query?: Q, body?: B): Promise<void>

  async call() {
    try {
      this.isSubmitting = true
      await this.exec(this.params, this.query, this.body)
    } finally {
      this.isSubmitting = false
      this.isSubmitted = true
    }
  }
}

export class TripError extends Error {}
