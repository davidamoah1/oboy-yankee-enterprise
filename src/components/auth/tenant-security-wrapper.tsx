import React from "react";

interface TenantSecurityWrapperProps {
  children: React.ReactNode;
}

export function TenantSecurityWrapper({ children }: TenantSecurityWrapperProps) {
  return <>{children}</>;
}
