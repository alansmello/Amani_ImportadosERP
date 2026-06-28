"use client";

import { Input } from "@/components/ui/input";

export type SupplierFormValues = {
  nome: string;
  telefone: string;
};

export type SupplierFormErrors = Partial<Record<keyof SupplierFormValues, string>>;

type SupplierFormFieldsProps = {
  values: SupplierFormValues;
  errors: SupplierFormErrors;
  disabled?: boolean;
  onChange: (field: keyof SupplierFormValues, value: string) => void;
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

export function SupplierFormFields({
  values,
  errors,
  disabled = false,
  onChange
}: SupplierFormFieldsProps) {
  return (
    <div className="grid gap-5">
      <div className="grid gap-2">
        <label className={fieldLabelClassName} htmlFor="supplier-name">
          Nome
        </label>
        <Input
          id="supplier-name"
          value={values.nome}
          onChange={(event) => onChange("nome", event.target.value)}
          disabled={disabled}
          aria-invalid={Boolean(errors.nome)}
          aria-describedby={
            errors.nome ? "supplier-name-error" : "supplier-name-help"
          }
          autoComplete="organization"
        />
        <p id="supplier-name-help" className={fieldHelpClassName}>
          Use o nome comercial reconhecido na operacao.
        </p>
        <div id="supplier-name-error">
          <FieldError message={errors.nome} />
        </div>
      </div>

      <div className="grid gap-2">
        <label className={fieldLabelClassName} htmlFor="supplier-phone">
          Telefone
        </label>
        <Input
          id="supplier-phone"
          type="tel"
          value={values.telefone}
          onChange={(event) => onChange("telefone", event.target.value)}
          disabled={disabled}
          maxLength={50}
          aria-invalid={Boolean(errors.telefone)}
          aria-describedby={
            errors.telefone ? "supplier-phone-error" : "supplier-phone-help"
          }
          autoComplete="tel"
        />
        <p id="supplier-phone-help" className={fieldHelpClassName}>
          Opcional. Aceita ate 50 caracteres.
        </p>
        <div id="supplier-phone-error">
          <FieldError message={errors.telefone} />
        </div>
      </div>
    </div>
  );
}
