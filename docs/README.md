# Phone Field

Phone Field is a VTEX IO app that handles formatting and validation of phone numbers. It
includes an UI component that renders a text field with a listbox that contains the flag of
the country and the respective [country calling code](https://en.wikipedia.org/wiki/List_of_country_calling_codes).

<img width="405" alt="component screenshot USA" src="https://user-images.githubusercontent.com/10223856/76995145-306bba80-692e-11ea-9f3b-847627dfc49f.png">
<img width="405" alt="component screenshot Brazil" src="https://user-images.githubusercontent.com/10223856/76907932-3efe9700-6886-11ea-8b01-1c81ce31a339.png">

## Usage

To use this app, you first need to add it in your `manifest.json` file, like so

```json
{
  "dependencies": {
    "vtex.phone-field": "0.x"
  }
}
```

> If you are developing in TypeScript, you may also want to run `vtex setup` after the step above

Then, you can import the phone context and field components and use it inside your forms:

```jsx
import React from 'react'
import { PhoneField, PhoneContext, rules } from 'vtex.phone-field'

const Form = () => {
  const [phone, setPhone] = React.useState('+15554567038')

  const handlePhoneChange = React.useCallback(({ value, isValid }) => {
    setPhone(value)
    // you can use the `isValid` variable to show some error message
  }, [])

  return (
    <form>
      <PhoneContext.PhoneContextProvider rules={rules}>
        <PhoneField
          label="Phone number"
          value={phone}
          onChange={handlePhoneChange}
        />
      </PhoneContext.PhoneContextProvider>
    </form>
  )
}
```

You might be wondering, _what is that `rules` variable?_ And there is a few reasons that it and the
phone context exists.

The rules variable includes all default rules that exist inside the `vtex.phone-field` app, but the
`PhoneField` component isn't limited to them. A rule is a definition of the format (mask) of the phone
number, alongside it's [country ISO alpha-3 code](https://en.wikipedia.org/wiki/ISO_3166-1_alpha-3) and
country calling code. This is used by the component to mask the number correctly and also do the validations.

The phone context exists so we can decouple the rules definition of the component itself. If you ever
want to include a rule that our app doesn't natively support yet, you can pass it to the `rules` prop
of the `PhoneContextProvider` component. If you have any problems with that, please
[open an issue](https://github.com/vtex-apps/phone-field/issues/new/choose)!

The country flags are all inside the app for now, and the `PhoneField` component is rendering them based on
the country ISO of the rule. For example, given the following rule:

```javascript
const rule = {
  countryISO: 'BRA',
  countryCode: '55',
  mask: '(99) 9 9999-9999',
}
```

The component will look for a flag named `BRA.svg` inside the `react/icons` folder of the app and
render it. If the component doesn't find the flag of the country, it will use a default gray flag as
a placeholder.

## Components

### PhoneField

Responsible for rendering the listbox with the text field and formatting and validating the phone number.

#### Props

The `PhoneField` component also accepts all props of [Styleguide's `Input`](https://styleguide.vtex.com/#/Components/Forms/Input),
except for the `value` and `onChange`, which are redefined by this component.

| Prop name | type | Required |
| --- | --- | --- |
| [`value`](#phonefield-value) | `string` | `true` |
| [`onChange`](#phonefield-onchange) | `func` | `true` |
| [`defaultCountry`](#phonefield-defaultcountry) | `string` | `false` |

##### PhoneField value

`value: string`

The phone field value. Can include the country calling code. E.g.: `+15554567038`, `+55999998888`

##### PhoneField onChange

`onChange: (data: { value: string; isValid: boolean }) => void`

Callback to trigger the change of phone value. Can be triggered by either typing on the text field
or by changing the country from the listbox.

##### PhoneField defaultCountry

`defaultCountry?: string`

The default country to show in the listbox. Used only when the phone number passed in `value`
doesn't have a country calling code or if we don't have a `value` at all.

### PhoneContext.PhoneContextProvider

The wrapper component for the phone number that provides the rules definitions.

#### Props

| Prop name | type | Required |
| --- | --- | --- |
| [`rules`](#phonecontext-rules) | `array` | `true` |

##### PhoneContext rules

`rules: Array<{ countryISO: string; countryCode: string; mask?: string }>`

The rules definitions used by the `<PhoneField />` component.
