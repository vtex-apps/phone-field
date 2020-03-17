export interface PhoneRuleDescriptor {
  /**
   * ISO3 Country code representation
   */
  countryISO: string
  /**
   * Country's international code number. E.g.: 55 for Brazil
   */
  countryCode: string
  /**
   * Mask to the phone. E.g.: (99) 9999-9999[9]
   */
  mask?: string
}

const defaultRules: PhoneRuleDescriptor[] = [
  {
    countryCode: '55',
    countryISO: 'BRA',
    mask: '(99) 9999-9999',
  },
  {
    countryCode: '54',
    countryISO: 'ARG',
    mask: '9 999 999-9999',
  },
  {
    countryCode: '1',
    countryISO: 'USA',
    mask: '999 9999999',
  },
]

export default defaultRules
