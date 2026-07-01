using System;
using System.Numerics;

namespace Amani.ImportadosERP.Domain.Common;

public readonly struct QuantidadeRacional : IComparable<QuantidadeRacional>, IEquatable<QuantidadeRacional>
{
    public BigInteger Numerador { get; }
    public BigInteger Denominador { get; }

    public static QuantidadeRacional Zero => new(BigInteger.Zero, BigInteger.One);

    public QuantidadeRacional(BigInteger numerador, BigInteger denominador)
    {
        if (denominador == 0) throw new ArgumentException("Denominador deve ser maior que zero", nameof(denominador));

        if (denominador < 0)
        {
            numerador = -numerador;
            denominador = -denominador;
        }

        if (numerador == 0)
        {
            Numerador = BigInteger.Zero;
            Denominador = BigInteger.One;
            return;
        }

        var divisor = BigInteger.GreatestCommonDivisor(BigInteger.Abs(numerador), denominador);
        Numerador = numerador / divisor;
        Denominador = denominador / divisor;
    }

    public static QuantidadeRacional DeDecimal(decimal valor)
    {
        var bits = decimal.GetBits(valor);
        var escala = (bits[3] >> 16) & 0x7F;
        var negativo = (bits[3] & int.MinValue) != 0;
        var numerador = ((BigInteger)(uint)bits[2] << 64)
            | ((BigInteger)(uint)bits[1] << 32)
            | (uint)bits[0];

        if (negativo) numerador = -numerador;
        return new QuantidadeRacional(numerador, BigInteger.Pow(10, escala));
    }

    public QuantidadeRacional Multiplicar(long quantidade) => new(Numerador * quantidade, Denominador);

    public decimal ParaDecimal(int casasDecimais = 12) =>
        decimal.Round((decimal)Numerador / (decimal)Denominador, casasDecimais, MidpointRounding.AwayFromZero);

    public long NumeradorInt64() => checked((long)Numerador);
    public long DenominadorInt64() => checked((long)Denominador);

    public int CompareTo(QuantidadeRacional other) =>
        (Numerador * other.Denominador).CompareTo(other.Numerador * Denominador);

    public bool Equals(QuantidadeRacional other) => Numerador == other.Numerador && Denominador == other.Denominador;
    public override bool Equals(object? obj) => obj is QuantidadeRacional other && Equals(other);
    public override int GetHashCode() => HashCode.Combine(Numerador, Denominador);
    public override string ToString() => $"{Numerador}/{Denominador}";

    public static QuantidadeRacional operator +(QuantidadeRacional left, QuantidadeRacional right) =>
        new(left.Numerador * right.Denominador + right.Numerador * left.Denominador, left.Denominador * right.Denominador);

    public static QuantidadeRacional operator -(QuantidadeRacional left, QuantidadeRacional right) =>
        new(left.Numerador * right.Denominador - right.Numerador * left.Denominador, left.Denominador * right.Denominador);

    public static bool operator <(QuantidadeRacional left, QuantidadeRacional right) => left.CompareTo(right) < 0;
    public static bool operator >(QuantidadeRacional left, QuantidadeRacional right) => left.CompareTo(right) > 0;
    public static bool operator <=(QuantidadeRacional left, QuantidadeRacional right) => left.CompareTo(right) <= 0;
    public static bool operator >=(QuantidadeRacional left, QuantidadeRacional right) => left.CompareTo(right) >= 0;
    public static bool operator ==(QuantidadeRacional left, QuantidadeRacional right) => left.Equals(right);
    public static bool operator !=(QuantidadeRacional left, QuantidadeRacional right) => !left.Equals(right);
}
