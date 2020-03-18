import { render, fireEvent, act } from '@vtex/test-tools/react'
import React, { useState } from 'react'

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
  it('should correctly mask a phone number given a rule', () => {
    const rules: PhoneRuleDescriptor[] = [
      {
        countryISO: 'ABC',
        countryCode: '123',
        mask: '999 999 9-9',
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

    fireEvent.change(phoneInput, { target: { value: '4567' } })

    expect(listboxButton).toHaveTextContent('+123')
    expect(phoneInput).toHaveValue('456 7')

    fireEvent.change(phoneInput, { target: { value: '45678901' } })

    expect(phoneInput).toHaveValue('456 789 0-1')

    fireEvent.change(phoneInput, { target: { value: '456789012' } })

    // the value shouldn't change as we have exceeded the mask
    expect(phoneInput).toHaveValue('456 789 0-1')
  })

  describe('default rules', () => {
    it('should correctly render the flag from the phone number', () => {
      const Component: React.FC = () => {
        return (
          <PhoneContextProvider rules={defaultRules}>
            <PhoneField label="Phone number" value="+5511999998888" />
          </PhoneContextProvider>
        )
      }

      const { getByRole } = render(<Component />)

      expect(getByRole('img')).toHaveAttribute('src', 'BRA.svg')
    })

    it('should correctly change the mask with country change', () => {
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

      const { getByRole } = render(<Component />)

      const listboxButton = getByRole('button')

      act(() => void fireMouseClick(listboxButton))

      const usaOption = getByRole('option', { name: '+ 1' })

      act(() => void fireMouseClick(usaOption))

      const phoneInput = getByRole('textbox')

      expect(phoneInput).toHaveValue('119-999-9888')
    })
  })
})
