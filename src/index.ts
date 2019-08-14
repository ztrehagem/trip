export abstract class Trip<P, Q, B, V = void> {
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

  protected abstract validator(params?: P, query?: Q, body?: B): V
  protected abstract executor(params?: P, query?: Q, body?: B): Promise<void>

  validate() {
    return this.validator(this.params, this.query, this.body)
  }

  async execute() {
    try {
      this.isSubmitting = true
      await this.executor(this.params, this.query, this.body)
    } finally {
      this.isSubmitting = false
      this.isSubmitted = true
    }
  }
}
