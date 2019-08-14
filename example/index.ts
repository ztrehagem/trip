import { Trip } from '../'

interface ApiResponse<T> {
  status: number
  data: T
}

interface StatusedResponse<S extends number, R> extends ApiResponse<R> {
  status: S
}

function api(config: unknown) {
  return new Promise<
    | StatusedResponse<200, User>
    | StatusedResponse<400, ValidationErrors>
    | StatusedResponse<500, null>
  >((res) => {
    console.log('* called:', config)
    switch (Math.floor(Math.random() * 3)) {
      case 0:
        res({ status: 200, data: { name: 'myname' } })
        break
      case 1:
        res({ status: 400, data: { name: ['ValidationErrors!'] } })
        break
      default:
        res({ status: 500, data: null })
    }
  })
}

interface UserParams {
  id: number
}

interface User {
  name: string
}

type ValidationErrors<K extends string = string> = Record<K, string[]>

class ValidationErrorBuilder {
  protected errors: ValidationErrors = {}

  add(key: string, message: string) {
    this.errors[key] = this.errors[key] || []
    this.errors[key].push(message)
  }

  build() {
    return this.errors
  }
}

class FooTrip extends Trip<UserParams, never, User> {
  user: { name: string } | null = null
  validationErrors: ValidationErrors = {}

  get hasValidationErrors() {
    return Object.keys(this.validationErrors).length > 0
  }

  validator(params?: UserParams, query?: never, body?: User) {
    const builder = new ValidationErrorBuilder()

    if (!params || !body) return

    if (params.id < 1) {
      builder.add('id', 'id error')
    }

    if (body.name.length < 1) {
      builder.add('name', 'name error')
    }

    this.validationErrors = builder.build()
  }

  protected async executor(params?: UserParams, query?: never, body?: User) {
    if (!params || !body) {
      throw null
    }

    const res = await api({ params, body })

    switch (res.status) {
      case 200:
        this.user = res.data
        this.validationErrors = {}
        break
      case 400:
        this.validationErrors = res.data
        break
      default:
        throw res
    }
  }
}

;(async () => {
  const t = new FooTrip()

  for (const i of [...Array(10).keys()]) {
    console.log(`(${i}) ---------------------`)
    t.setParams({ id: i })
    t.setBody({ name: `myname:${i}` })

    t.validate()

    console.log(t.isSubmitted)

    if (t.hasValidationErrors) {
      console.log('* before validation error', t.validationErrors)
      continue
    }

    try {
      await t.execute()
      if (t.hasValidationErrors) {
        console.log('* after validation error:', t.validationErrors)
      } else {
        console.log('* success:', t.user)
      }
    } catch (error) {
      console.log('* api error:', error)
    }
  }
})()
