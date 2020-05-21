import msk from 'msk'
import React, { useMemo, useRef } from 'react'
import { Input } from 'vtex.styleguide'
import { Listbox } from 'vtex.checkout-components'
import { CountryFlag } from 'vtex.country-flags'

import { usePhoneContext } from './PhoneContext'
import styles from './PhoneField.css'
import { PhoneRuleDescriptor } from './rules'

const {
  ListboxInput,
  ListboxButton,
  ListboxPopover,
  ListboxList,
  ListboxOption,
} = Listbox

interface PhoneData {
  value: string
  isValid: boolean
}

interface Props
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    'onChange' | 'value'
  > {
  onChange?: (data: PhoneData) => void
  value?: string
  defaultCountry?: string
  // Input's props
  label?: string | React.ReactElement
  error?: boolean
  errorMessage?: string
  helpText?: React.ReactNode
  suffix?: React.ReactNode
  isLoadingButton?: boolean
}

const renderCountryFlagWithCode = ({
  country,
  code,
}: {
  country: string
  code: string
}) => (
  <>
    <CountryFlag iso3={country} />
    <span className="dib ml3">+{code}</span>
  </>
)

const unmaskPhone = (phone: string) => phone.replace(/\D/g, '')

const PhoneField = React.forwardRef<HTMLInputElement, Props>(
  function PhoneField(
    { onChange = () => {}, value = '', defaultCountry = 'BRA', ...props },
    ref
  ) {
    const { rules } = usePhoneContext()
    const inputRef = useRef<HTMLInputElement>(null)

    const phoneData = useMemo(() => {
      let phoneValue = value
      let selectedCountry = defaultCountry

      if (value.startsWith('+')) {
        phoneValue = unmaskPhone(value.substr(1))
        const phoneRule = rules.find(({ countryCode }) => {
          return phoneValue.startsWith(countryCode)
        })

        if (!phoneRule) {
          throw new Error(`Unsupported phone number ${value}.`)
        }

        selectedCountry = phoneRule.countryISO
        phoneValue = phoneValue.substr(phoneRule.countryCode.length)
      } else {
        phoneValue = unmaskPhone(value)
      }

      return { phoneValue, selectedCountry }
    }, [defaultCountry, rules, value])

    const countryRule = useMemo(
      () =>
        rules.find(
          ({ countryISO }) => countryISO === phoneData.selectedCountry
        ),
      [rules, phoneData.selectedCountry]
    )!

    const updatePhone = (phone: string, rule: PhoneRuleDescriptor) => {
      const updatedValue = rule.mask ? msk.fit(phone, rule.mask) : phone

      onChange({
        value: `+${rule.countryCode}${unmaskPhone(updatedValue)}`,
        isValid: !rule.mask || rule.mask.length === updatedValue.length,
      })
    }

    const handleChange: React.ChangeEventHandler<HTMLInputElement> = ({
      target: { value: eventValue },
    }) => {
      updatePhone(eventValue, countryRule)
    }

    const handleCountryUpdate = (country: string) => {
      const newRule = rules.find(({ countryISO }) => countryISO === country)!

      updatePhone(phoneData.phoneValue, newRule)

      // schedule focus for the next tick since the listbox
      // is already focused by default after this event handler,
      // and we need to override that
      setTimeout(() => void inputRef.current?.focus(), 0)
    }

    return (
      <div className={styles.phoneField}>
        <Input
          {...props}
          inputMode="numeric"
          value={
            countryRule.mask
              ? msk(phoneData.phoneValue, countryRule.mask)
              : phoneData.phoneValue
          }
          onChange={handleChange}
          ref={(node: HTMLInputElement) => {
            if (ref) {
              if (typeof ref === 'function') {
                ref(node)
              } else {
                // @ts-ignore: React TS types says this is read-only, but
                // it its possible to mutate this value
                ref.current = node
              }
            }
            // @ts-ignore: same as above
            inputRef.current = node
          }}
          prefix={
            <ListboxInput
              className="h-100 flex-auto"
              value={phoneData.selectedCountry}
              onChange={handleCountryUpdate}
            >
              <ListboxButton>
                {({ label }) =>
                  renderCountryFlagWithCode({
                    country: phoneData.selectedCountry,
                    code: label,
                  })
                }
              </ListboxButton>
              <ListboxPopover className="nl1" style={{ minWidth: 192 }}>
                <ListboxList>
                  {rules.map(({ countryCode, countryISO }) => {
                    return (
                      <ListboxOption
                        value={countryISO}
                        label={countryCode}
                        key={countryISO}
                      >
                        {renderCountryFlagWithCode({
                          country: countryISO,
                          code: countryCode,
                        })}
                      </ListboxOption>
                    )
                  })}
                </ListboxList>
              </ListboxPopover>
            </ListboxInput>
          }
        />
      </div>
    )
  }
)

export default PhoneField
