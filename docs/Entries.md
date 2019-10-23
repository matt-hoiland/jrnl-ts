# Entries

## File content format

The base unit of the journal is the `Entry`. The entry has the following format:

```
<Entry> ::= <title-line>?/\s+/<metadata>/\s+/<body-text>
<title-line> ::= /# .+\n/
<metadata> ::= /^```json\n/{MetaData}/^```/
<body-text> ::= /^/{Markdown}
```

where `{MetaData}` is defined in [MetaData.json](../src/model/MetaData.json) and `{Markdown}` is simply [github flavored markdown](https://github.github.com/gfm/).

### Example:

```markdown
# A Journal Entry

{MetaData}

Body content
```

## File name format

The file name for an entry can be build directly from its metadata:

```
<filename> ::= <date>/_/<day><simplified-title>?/\.md/
<date> ::= {MetaData.date.slice(0,10)}
<day> ::= /(Su|Mo|Tu|We|Th|Fr|Sa)/
<simplified-title> ::= {MetaData.title | simplifier}
```

where `{MetaData.date.slice(0,10)}` corresponds to only the `YYYY-MM-DD` portion of the date, and `{MetaData.title | simplifier}` is the title field piped through a simplifier function to be defined as later (to make sure the file name is in agreement with file system naming rules). Redundantly, the file name is stored in the `MetaData`.

Example: `1970-01-01_Th_a_journal_entry.md`

### File name regex

All correct journal entry file names should conform to this pattern:

```js
/\d{4}-\d{2}-\d{2}_(Su|Mo|Tu|We|Th|Fr|Sa)(_[a-z0-9][a-z0-9_]+[a-z0-9])?\.md/
```

where the title portion is optional. Titles in the filename can only have lower case characters and digits with underscores between the words.


### The simplifier function

Since the title of an entry can be any sequence of non-linebreak unicode characters, the simplifier has to be able to drop and or replace characters that invalid for a file system or inconvenient in a shell environment. It also truncates the title to a maximum character length on word boundaries.
