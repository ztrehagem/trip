import { Trip } from './'

interface ApiResponse<T> {
  status: number
  data: T
}

interface StatusedResponse<S extends number, R> extends ApiResponse<R> {
  status: S
}

function api(config) {
  return new Promise<
    | StatusedResponse<200, User>
    | StatusedResponse<400, Invalid>
    | StatusedResponse<500, null>
  >((res) => {
    console.log('called', config)
    switch (Math.floor(Math.random() * 3)) {
      case 0:
        res({ status: 200, data: { name: 'myname' } })
        break
      case 1:
        res({ status: 400, data: { name: ['invalid!'] } })
        break
      default:
        res({ status: 500, data: null })
    }
  })
}

interface FooTripParams {
  id: number
}

interface User {
  name: string
}

interface Invalid {
  [key: string]: string[]
}

class FooTrip extends Trip<FooTripParams, never, User> {
  user: { name: string } | null = null
  invalid: Invalid | null = null

  protected async exec(params?: FooTripParams, query?: never, body?: User) {
    if (!params || !body) {
      throw null
    }

    const res = await api({ params, body })

    switch (res.status) {
      case 200:
        this.user = res.data
        this.invalid = null
        break
      case 400:
        this.invalid = res.data
        break
      default:
        throw res
    }
  }
}

;(async () => {
  const t = new FooTrip()

  for (const i of [...Array(10).keys()]) {
    t.setParams({ id: i })
    t.setBody({ name: `myname:${i}` })

    try {
      console.log(t.isSubmitted, '--------------')
      await t.call()
      console.log(t.user, t.invalid)
    } catch (error) {
      console.log('error:', error)
    }
  }
})()
