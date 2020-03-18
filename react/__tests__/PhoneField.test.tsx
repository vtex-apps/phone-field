import { render } from '@vtex/test-tools'
import React from 'react'

import PhoneField from '../PhoneField'
import rules from '../rules'
import { PhoneContextProvider } from '../PhoneContext'

describe('<PhoneField />', () => {
  describe('default rules', () => {
    it('should correctly render the flag from the phone number', () => {
      const Component: React.FC = () => {
        return (
          <PhoneContextProvider rules={rules}>
            <PhoneField value="+5511999998888" />
          </PhoneContextProvider>
        )
      }

      const { getByRole } = render(<Component />)

      const listbox = getByRole('listbox')

      expect(listbox).toBeInTheDocument()
    })
  })
})
