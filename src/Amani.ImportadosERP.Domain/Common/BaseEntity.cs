using System;

namespace Amani.ImportadosERP.Domain.Common;

public abstract class BaseEntity
{
    public Guid Id { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public DateTime? UpdatedAt { get; private set; }

    protected BaseEntity()
    {
        Id = Guid.NewGuid();
        CreatedAt = DateTime.UtcNow;
    }

    protected void Touch()
    {
        UpdatedAt = DateTime.UtcNow;
    }
}
