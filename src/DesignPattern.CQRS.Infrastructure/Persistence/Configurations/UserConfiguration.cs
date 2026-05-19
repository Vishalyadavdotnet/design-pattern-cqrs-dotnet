using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using DesignPattern.CQRS.Domain.Entities;

namespace DesignPattern.CQRS.Infrastructure.Persistence.Configurations;

public class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder.HasKey(u => u.Id);

        builder.Property(u => u.Name)
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(u => u.Email)
            .HasMaxLength(150)
            .IsRequired();

        builder.HasIndex(u => u.Email)
            .IsUnique();

        builder.Property(u => u.CreatedAt)
            .IsRequired();
    }
}
