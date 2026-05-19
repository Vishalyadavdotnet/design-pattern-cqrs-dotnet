using System;
using System.Collections.Generic;

namespace DesignPattern.CQRS.Domain.Exceptions;

public class CustomValidationException : Exception
{
    public IDictionary<string, string[]> Errors { get; }

    public CustomValidationException()
        : base("One or more validation failures have occurred.")
    {
        Errors = new Dictionary<string, string[]>();
    }

    public CustomValidationException(IDictionary<string, string[]> errors)
        : base("One or more validation failures have occurred.")
    {
        Errors = errors;
    }
}
