// Peregrine for Web: native container for hybrid apps
// Copyright (C) 2022 Caracal LLC
//
// This program is free software: you can redistribute it and/or modify it
// under the terms of the GNU General Public License version 3 as published
// by the Free Software Foundation.
//
// This program is distributed in the hope that it will be useful, but WITHOUT
// ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
// FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for
// more details.
//
// You should have received a copy of the GNU General Public License version 3
// along with this program. If not, see <https://www.gnu.org/licenses/>.

import wait from '../../lib/wait'
import AsyncIterableSubject from '../AsyncIterableSubject'

it('should emit a single value and continue looping', async () => {
  expect.assertions(1)

  const subject = new AsyncIterableSubject<number>()
  const subscribe = async () => {
    for await (const value of subject) {
      expect(value).toBe(1)
    }
    expect(true).toBe(false) // won't reach because it should continue looping
  }

  subscribe()
  subject.next(1)
})

it('should throw error when attempting to send new value before consumption', async () => {
  const subject = new AsyncIterableSubject<number>()
  subject.next(1)
  expect(() => subject.next(2)).toThrowError(
    'Cannot feed value--previous value(s) are unconsumed',
  )
})

it('should throw error when attempting to cancel before consumption', async () => {
  const subject = new AsyncIterableSubject<number>()
  subject.next(1)
  expect(() => subject.done()).toThrowError(
    'Cannot finish--previous value(s) are unconsumed',
  )
})

it('should throw error when iterating more than once', async () => {
  const subject = new AsyncIterableSubject<number>()
  const subscribe = async () => {
    for await (const _ of subject) {
      // ignore
    }
  }

  subscribe()

  expect(() => subscribe()).rejects.toThrowError(
    'Cannot iterate more than once',
  )
})

it('should iterate and emit correct values', async () => {
  expect.assertions(3)

  const subject = new AsyncIterableSubject<number>()
  const subscribe = async () => {
    let counter = 1
    for await (const value of subject) {
      expect(value).toBe(counter)
      counter++
    }
    expect(true).toBe(false) // won't reach because it should continue looping
  }

  subscribe()

  for (const n of [1, 2, 3]) {
    await wait(5)
    subject.next(n)
  }
})

it('should iterate and finish when done() is called', async () => {
  expect.assertions(4)

  const subject = new AsyncIterableSubject<number>()
  const subscribe = async () => {
    let counter = 1
    for await (const value of subject) {
      expect(value).toBe(counter)
      counter++
    }
    expect(true).toBe(true)
  }

  subscribe()

  for (const n of [1, 2, 3]) {
    await wait(5)
    subject.next(n)
  }

  await wait(5)
  subject.done()
})
