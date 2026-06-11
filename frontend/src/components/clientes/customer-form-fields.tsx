"use client";

import { Input } from "@/components/ui/input";

export type CustomerFormValues = {
  nome: string;
  email: string;
  telefone: string;
};

export type CustomerFormErrors = Partial<
  Record<keyof CustomerFormValues, string>
>;

type CustomerFormFieldsProps = {
  values: CustomerFormValues;
  errors: CustomerFormErrors;
  disabled?: boolean;
  onChange: (field: keyof CustomerFormValues, value: string) => void;
};

const fieldLabelClassName = "text-sm font-medium text-text-primary";
const fieldHelpClassName = "text-xs leading-5 text-text-secondary";
const fieldErrorClassName = "text-xs font-medium leading-5 text-danger";

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className={fieldErrorClassName}>{message}</p>;
}

export function CustomerFormFields({
  values,
  errors,
  disabled = false,
  onChange
}: CustomerFormFieldsProps) {
  return (
    <div className="grid gap-5">
      <div className="grid gap-2">
        <label className={fieldLabelClassName} htmlFor="customer-name">
          Nome
        </label>
        <Input
          id="customer-name"
          value={values.nome}
          onChange={(event) => onChange("nome", event.target.value)}
          disabled={disabled}
          aria-invalid={Boolean(errors.nome)}
          aria-describedby={
            errors.nome ? "customer-name-error" : "customer-name-help"
          }
          autoComplete="name"
        />
        <p id="customer-name-help" className={fieldHelpClassName}>
          Obrigatorio para salvar o cliente.
        </p>
        <div id="customer-name-error">
          <FieldError message={errors.nome} />
        </div>
      </div>

      <div className="grid gap-5 tablet:grid-cols-2">
        <div className="grid gap-2">
          <label className={fieldLabelClassName} htmlFor="customer-email">
            Email
          </label>
          <Input
            id="customer-email"
            type="email"
            value={values.email}
            onChange={(event) => onChange("email", event.target.value)}
            disabled={disabled}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={
              errors.email ? "customer-email-error" : undefined
            }
            autoComplete="email"
          />
          <div id="customer-email-error">
            <FieldError message={errors.email} />
          </div>
        </div>

        <div className="grid gap-2">
          <label className={fieldLabelClassName} htmlFor="customer-phone">
            Telefone
          </label>
          <Input
            id="customer-phone"
            type="tel"
            inputMode="tel"
            value={values.telefone}
            onChange={(event) => onChange("telefone", event.target.value)}
            disabled={disabled}
            aria-invalid={Boolean(errors.telefone)}
            aria-describedby={
              errors.telefone ? "customer-phone-error" : undefined
            }
            autoComplete="tel"
          />
          <div id="customer-phone-error">
            <FieldError message={errors.telefone} />
          </div>
        </div>
      </div>
    </div>
  );
}
