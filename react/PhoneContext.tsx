import React, { createContext, useContext, useMemo } from 'react'

import { PhoneRuleDescriptor } from './rules'

interface Context {
  rules: PhoneRuleDescriptor[]
}

const PhoneContext = createContext<Context | undefined>(undefined)

export const usePhoneContext = () => {
  const contextValue = useContext(PhoneContext)

  if (contextValue === undefined) {
    throw new Error(
      'usePhoneContext must be used inside a PhoneContextProvider'
    )
  }

  return contextValue
}

export const PhoneContextProvider: React.FC<Context> = ({
  rules,
  children,
}) => {
  const contextValue = useMemo(
    () => ({
      rules: rules.sort((ruleA, ruleB) =>
        ruleA.countryISO > ruleB.countryISO
          ? 1
          : ruleA.countryISO < ruleB.countryISO
          ? -1
          : 0
      ),
    }),
    [rules]
  )

  return (
    <PhoneContext.Provider value={contextValue}>
      {children}
    </PhoneContext.Provider>
  )
}

export default { PhoneContextProvider, usePhoneContext }
