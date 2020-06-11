import { render, fireEvent, act } from '@vtex/test-tools/react'
import React, { useState, useEffect, useRef } from 'react'

import PhoneField from '../PhoneField'
import defaultRules, { PhoneRuleDescriptor } from '../rules'
import { PhoneContextProvider } from '../PhoneContext'

/**
 * Listbox opens on mousedown, not click event
 */
function fireMouseClick(element: HTMLElement) {
  fireEvent.mouseDown(element)
  fireEvent.mouseUp(element)
}

describe('<PhoneField />', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.clearAllTimers()
  })

  it('should correctly mask a phone number given a rule', () => {
    const rules: PhoneRuleDescriptor[] = [
      {
        countryISO: 'ABC',
        countryCode: '123',
        mask: '999 999 9-9',
        pattern: '\\d{8}',
      },
    ]

    const Component: React.FC = () => {
      const [phone, setPhone] = useState('')

      const handlePhoneChange = ({ value }: { value: string }) => {
        setPhone(value)
      }

      return (
        <PhoneContextProvider rules={rules}>
          <PhoneField
            label="Phone number"
            value={phone}
            defaultCountry="ABC"
            onChange={handlePhoneChange}
          />
        </PhoneContextProvider>
      )
    }

    const { getByRole } = render(<Component />)

    const phoneInput = getByRole('textbox')
    const listboxButton = getByRole('button')

    fireEvent.focus(phoneInput)

    fireEvent.change(phoneInput, { target: { value: '4567' } })

    expect(listboxButton).toHaveTextContent('+123')

    expect(phoneInput).toHaveValue('4567')

    fireEvent.change(phoneInput, { target: { value: '45678901' } })

    expect(phoneInput).toHaveValue('45678901')

    fireEvent.change(phoneInput, { target: { value: '456789012' } })

    fireEvent.blur(phoneInput)

    expect(phoneInput).toHaveValue('456 789 0-12')
  })

  it('should show error message for invalid phones', () => {
    const Component: React.FC = () => {
      const [phone, setPhone] = useState('')
      const [valid, setValid] = useState(false)

      const handlePhoneChange = ({
        value,
        isValid,
      }: {
        value: string
        isValid: boolean
      }) => {
        setPhone(value)
        setValid(isValid)
      }

      return (
        <PhoneContextProvider rules={defaultRules}>
          <PhoneField
            label="Phone number"
            value={phone}
            defaultCountry="BRA"
            onChange={handlePhoneChange}
          />
          {!valid && <span>Phone is invalid</span>}
        </PhoneContextProvider>
      )
    }

    const { getByRole, queryByText } = render(<Component />)

    const phoneInput = getByRole('textbox')

    expect(queryByText(/phone is invalid/i)).toBeInTheDocument()

    fireEvent.change(phoneInput, { target: { value: '21988884444' } })

    expect(queryByText(/phone is invalid/i)).not.toBeInTheDocument()

    fireEvent.change(phoneInput, { target: { value: '219888844443' } })

    expect(queryByText(/phone is invalid/i)).toBeInTheDocument()
  })

  it('should focus the input button on flag change', () => {
    const Component: React.FC = () => {
      const [phone, setPhone] = useState('+5511999998888')

      return (
        <PhoneContextProvider rules={defaultRules}>
          <PhoneField
            label="Phone number"
            value={phone}
            onChange={({ value }) => setPhone(value)}
          />
        </PhoneContextProvider>
      )
    }

    const { getByRole, getByLabelText } = render(<Component />)

    const phoneInput = getByLabelText(/phone number/i)

    expect(document.activeElement).not.toBe(phoneInput)

    const listboxButton = getByRole('button')

    act(() => void fireMouseClick(listboxButton))

    const usaOption = getByRole('option', { name: '+ 1' })

    act(() => {
      fireMouseClick(usaOption)
      jest.runAllTimers()
    })

    expect(document.activeElement).toBe(phoneInput)
  })

  it('should use pattern for phone validation', () => {
    const rules: PhoneRuleDescriptor[] = [
      { countryISO: 'ABC', countryCode: '1', pattern: '\\d{9}' },
    ]

    const Component: React.FC = () => {
      const [phone, setPhone] = useState('+1')
      const [valid, setValid] = useState(false)

      const handlePhoneChange = ({
        value,
        isValid,
      }: {
        value: string
        isValid: boolean
      }) => {
        setPhone(value)
        setValid(isValid)
      }

      return (
        <PhoneContextProvider rules={rules}>
          <PhoneField
            label="Phone number"
            value={phone}
            onChange={handlePhoneChange}
          />
          {!valid && <span>Phone is invalid</span>}
        </PhoneContextProvider>
      )
    }

    const { getByRole, queryByText } = render(<Component />)

    const phoneField = getByRole('textbox')

    fireEvent.focus(phoneField)

    fireEvent.change(phoneField, { target: { value: '123 456' } })

    expect(queryByText(/phone is invalid/i)).toBeInTheDocument()

    fireEvent.change(phoneField, { target: { value: '123 456 789' } })

    expect(queryByText(/phone is invalid/i)).not.toBeInTheDocument()

    fireEvent.blur(phoneField)

    expect(phoneField).toHaveValue('123 456 789')
  })

  it('should be able to accept refs in phone field', () => {
    let ref = null

    const Component: React.FC = () => {
      const inputRef = useRef<HTMLInputElement>(null)

      useEffect(() => {
        ref = inputRef.current
      })

      return (
        <PhoneContextProvider rules={defaultRules}>
          <PhoneField
            label="Phone number"
            value="+5511999998888"
            ref={inputRef}
          />
        </PhoneContextProvider>
      )
    }

    const { getByLabelText } = render(<Component />)

    expect(ref).toBe(getByLabelText(/phone number/i))
  })

  it("should show phone number when rule don't have a mask", () => {
    const rules = [
      {
        countryISO: 'ABC',
        countryCode: '1',
        pattern: '.*',
      },
    ]

    const Component: React.FC = () => {
      return (
        <PhoneContextProvider rules={rules}>
          <PhoneField label="Phone number" value="+1123456" />
        </PhoneContextProvider>
      )
    }

    const { getByLabelText } = render(<Component />)

    const phoneInput = getByLabelText(/phone number/i)

    expect(phoneInput).toHaveValue('123456')
  })

  describe('default rules', () => {
    it('should correctly apply the USA mask with country change', () => {
      const Component: React.FC = () => {
        const [phone, setPhone] = useState('+5511999998888')
        const [valid, setValid] = useState(true)

        return (
          <PhoneContextProvider rules={defaultRules}>
            <PhoneField
              label="Phone number"
              value={phone}
              onChange={({ value, isValid }) => {
                setPhone(value)
                setValid(isValid)
              }}
            />
            {!valid && <span>Phone is invalid</span>}
          </PhoneContextProvider>
        )
      }

      const { getByRole, getByLabelText, getByText } = render(<Component />)

      const listboxButton = getByRole('button')

      act(() => void fireMouseClick(listboxButton))

      const usaOption = getByRole('option', { name: '+ 1' })

      act(() => void fireMouseClick(usaOption))

      const phoneInput = getByLabelText(/phone number/i)

      expect(phoneInput).toHaveValue('119-999-98888')

      const errorMessage = getByText(/phone is invalid/i)

      expect(errorMessage).toBeInTheDocument()
    })
  })
})
