# Entries

The base unit of the journal is the `Entry`. The entry has the following format:

```
<Entry> ::= <title-line>?/\s+/<metadata>/\s+/<body-text>
<title-line> ::= /# .+\n/
<metadata> ::= /^```json\n/{MetaData}/^```/
<body-text> ::= /^/{Markdown}
```

where `{MetaData}` is defined in [MetaData.json](../src/model/MetaData.json) and `{Markdown}` is simply [github flavored markdown](https://github.github.com/gfm/).
