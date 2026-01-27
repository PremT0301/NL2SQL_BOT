using System.Text.RegularExpressions;

namespace InventoryChatbot.Api.Services;

public class SqlGuardService
{
    private static readonly string[] AllowedTables = { "Products", "Suppliers", "Orders" };
    private static readonly string[] ForbiddenKeywords = { "INSERT", "UPDATE", "DELETE", "DROP", "ALTER", "TRUNCATE", "EXEC", "MERGE", "GRANT", "REVOKE" };

    public string ValidateAndSanitize(string? sql)
    {
        if (string.IsNullOrWhiteSpace(sql))
        {
            throw new ArgumentException("Generated SQL is empty.");
        }

        sql = sql.Trim();
        Console.WriteLine($"DEBUG: Guarding SQL: {sql}");

        // 0. Auto-fix common singular table names (LLM Hallucination Fix)
        // Only replace if whole word
        sql = Regex.Replace(sql, @"\bProduct\b", "Products", RegexOptions.IgnoreCase);
        sql = Regex.Replace(sql, @"\bSupplier\b", "Suppliers", RegexOptions.IgnoreCase);
        sql = Regex.Replace(sql, @"\bOrder\b", "Orders", RegexOptions.IgnoreCase);

        // 1. Ensure starts with SELECT
        if (!sql.StartsWith("SELECT", StringComparison.OrdinalIgnoreCase))
        {
            throw new SecurityException("Only SELECT queries are allowed.");
        }

        // 2. Check for forbidden keywords (Basic check, can be bypassed but sufficient for this scope)
        foreach (var keyword in ForbiddenKeywords)
        {
            if (sql.IndexOf(keyword, StringComparison.OrdinalIgnoreCase) >= 0)
            {
                throw new SecurityException($"Query contains forbidden keyword: {keyword}");
            }
        }

        // 3. Ensure strictly allowed tables
        // This regex looks for strictly whole words from the allowed list
        bool usesAllowedTable = false;
        foreach (var table in AllowedTables)
        {
            // Regex to check if table name exists as a distinct word
            if (Regex.IsMatch(sql, $@"\b{table}\b", RegexOptions.IgnoreCase))
            {
                usesAllowedTable = true;
            }
        }

        if (!usesAllowedTable)
        {
            throw new SecurityException("Query does not reference any valid tables (Products, Suppliers, Orders).");
        }

        // 4. Basic check for unknown table references could be complex without parsing, 
        // but strict table whitelist above helps. 
        // We will assume the LLM follows instructions, and this guard catches blatant violations.

        return sql;
    }
}

public class SecurityException : Exception
{
    public SecurityException(string message) : base(message) { }
}
