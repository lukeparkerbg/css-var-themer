# API Key Testing Guide

## ⚠️ NEVER Share Your Real API Key Publicly

Your OpenAI API key is sensitive and should NEVER be:
- Posted in comments on GitHub
- Committed to a repository
- Shared in screenshots
- Sent in plain text messages

## Safe Ways to Test

### Option 1: Create a Test Key (Recommended)
1. Go to https://platform.openai.com/api-keys
2. Create a new API key specifically for testing
3. Set usage limits on this key (e.g., $5 maximum)
4. Share this limited key privately (see methods below)
5. Delete the key immediately after testing is complete

### Option 2: Use GitHub Secrets (For Repository Collaborators)
If you're a collaborator on the repository:
1. Go to repository Settings → Secrets and variables → Actions
2. Add a new repository secret called `OPENAI_API_KEY_TEST`
3. The developer can access this in GitHub Actions without seeing the actual key

### Option 3: Encrypted Communication
If you need to share directly with the developer:
1. Use encrypted messaging (Signal, ProtonMail, etc.)
2. Send the key in a self-destructing message
3. Or use a service like https://onetimesecret.com/
   - Paste your API key
   - Set it to expire after 1 view
   - Share the link privately

### Option 4: Testing Without Sharing
You can test the functionality yourself:
1. Set your API key locally: `export OPENAI_API_KEY='your-key'`
2. Run the CLI or extension
3. Report the results (errors, truncated responses, etc.)
4. Share debug output (which doesn't contain the key)

## Debug Information to Share

Instead of sharing your API key, you can share:

```bash
# Run with debug mode
DEBUG=1 OPENAI_API_KEY='your-key' node cli.js extract --url https://example.com --themes "dark,light"
```

Then share:
- Error messages (sanitized of any key information)
- The number of CSS variables being processed
- Whether the response appears truncated
- The `finish_reason` from the API response

## What We Fixed

The recent update increased `max_tokens` from 2000 to 4096 to prevent truncation when processing many CSS variables. The code now also:
- Detects when responses are truncated
- Attempts to repair incomplete JSON
- Falls back to original values for missing variables
- Provides warnings when truncation occurs

## Testing the Fix Yourself

1. Clone the latest code
2. Set your API key: `export OPENAI_API_KEY='your-actual-key'`
3. Test with a page that has many CSS variables:
   ```bash
   node cli.js extract --url http://localhost:8080/example.html --themes "dark mode"
   ```
4. Check the console for any truncation warnings
5. Verify all CSS variables are in the output

## If You Still See Issues

Report:
- How many CSS variables were extracted
- The theme description you used
- Whether you see "truncated" warnings in console
- The last few lines of the generated theme JSON

This helps us debug without needing your API key!
