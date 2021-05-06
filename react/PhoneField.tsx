import classnames from 'classnames'
import msk from 'msk'
import React, { useMemo, useRef, useState, useEffect, useCallback } from 'react'
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
    'onChange' | 'value' | 'size'
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
  size?: 'small' | 'regular' | 'large'
  isLoadingButton?: boolean
}

const renderCountryFlagWithCode = ({
  country,
  code,
}: {
  country: string
  code?: string
}) => (
  <>
    <CountryFlag iso3={country} />
    {code && <span className="dib ml3">+{code}</span>}
  </>
)

const ArrowDownIcon: React.FC<{ size?: number; color?: string }> = ({
  size = 16,
  color = 'currentColor',
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
  >
    <g fill={color}>
      <path d="M7.41 7.84L12 12.42l4.59-4.58L18 9.25l-6 6-6-6z" />
    </g>
  </svg>
)

const unmaskPhone = (phone: string) => phone.replace(/\D/g, '')

const PhoneField = React.forwardRef<HTMLInputElement, Props>(
  function PhoneField(
    { onChange = () => {}, value = '', defaultCountry = 'BRA', ...props },
    ref
  ) {
    const { rules } = usePhoneContext()
    const inputRef = useRef<HTMLInputElement>(null)

    const [inputHovered, setInputHovered] = useState(false)
    const [inputFocused, setInputFocused] = useState(false)
    const [hovered, setHovered] = useState(false)

    const phoneData = useMemo(() => {
      let phoneValue = value
      let selectedCountry = !value ? defaultCountry : ''

      if (value.startsWith('+')) {
        phoneValue = value.substr(1)
        const unmaskedPhone = unmaskPhone(phoneValue)

        const phoneRule = rules.find(({ countryCode }) => {
          return unmaskedPhone.startsWith(countryCode)
        })

        if (phoneRule) {
          selectedCountry = phoneRule.countryISO
          phoneValue = phoneValue.substr(phoneRule.countryCode.length)
        }
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
    )

    const onChangeRef = useRef(onChange)

    useEffect(() => {
      onChangeRef.current = onChange
    }, [onChange])

    const updatePhone = useCallback(
      (phone: string, rule: PhoneRuleDescriptor) => {
        const unmaskedValue = `+${rule.countryCode}${unmaskPhone(phone)}`

        onChangeRef.current({
          value: `+${rule.countryCode}${phone}`,
          isValid: !!unmaskedValue.match(rule.pattern),
        })
      },
      []
    )

    useEffect(() => {
      if (inputFocused || !countryRule || !countryRule.mask) {
        return
      }

      const phone = msk(unmaskPhone(phoneData.phoneValue), countryRule.mask)

      updatePhone(phone, countryRule)
    }, [phoneData.phoneValue, countryRule, inputFocused, updatePhone])

    const handleChange: React.ChangeEventHandler<HTMLInputElement> = ({
      target: { value: eventValue },
    }) => {
      if (!countryRule) {
        return
      }

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

    const handleInputMouseEnter: React.MouseEventHandler<HTMLInputElement> = evt => {
      setInputHovered(true)
      props.onMouseEnter?.(evt)
    }

    const handleInputMouseLeave: React.MouseEventHandler<HTMLInputElement> = evt => {
      setInputHovered(false)
      props.onMouseLeave?.(evt)
    }

    const handleInputFocus: React.FocusEventHandler<HTMLInputElement> = evt => {
      setInputFocused(true)
      props.onFocus?.(evt)
    }

    const handleInputBlur: React.FocusEventHandler<HTMLInputElement> = evt => {
      setInputFocused(false)
      props.onBlur?.(evt)
    }

    const handleMouseEnter = () => {
      setHovered(true)
    }

    const handleMouseLeave = () => {
      setHovered(false)
    }

    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    const hasError = !!(props.error || props.errorMessage)

    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    const inputDisabled = props.disabled || !countryRule

    return (
      <div className={styles.phoneField}>
        <Input
          {...props}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          onMouseEnter={handleInputMouseEnter}
          onMouseLeave={handleInputMouseLeave}
          disabled={inputDisabled}
          inputMode="numeric"
          value={phoneData.phoneValue}
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
              disabled={inputDisabled}
            >
              <ListboxButton
                className={classnames(styles.listboxButton, 'br bw1 br-2', {
                  'b--danger': hasError,
                  'b--muted-4':
                    !(hovered || inputHovered || inputFocused) && !hasError,
                  'b--muted-3':
                    (hovered || inputHovered) && !inputFocused && !hasError,
                  'b--muted-2': inputFocused && !hasError,
                })}
                variation="plain"
                arrow={
                  <div className="c-action-primary flex items-center ml2">
                    <ArrowDownIcon />
                  </div>
                }
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                {({ label }) =>
                  renderCountryFlagWithCode({
                    country: phoneData.selectedCountry,
                    code: label,
                  })
                }
              </ListboxButton>
              <ListboxPopover
                className="nl1"
                style={{ minWidth: 192, maxHeight: 200 }}
              >
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
