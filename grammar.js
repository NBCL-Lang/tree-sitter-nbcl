/**
 * @file Tree sitter for Node Based Configuration Language (NBCL)
 * @author Byson94 <byson94wastaken@gmail.com>
 * @license MIT
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

export default grammar({
  name: "nbcl",

  rules: {
    source_file: $ => repeat($._definition),
    _definition: $ => choice(
      $.variable_declaration,
      $.function_definition,
      $.function_call,
      $.if_stmt,
      $.match_stmt,
      $.import_stmt,
      $.loops,
      $.standalone_kw
    ),

    // Variable and function calls
    variable_declaration: $ => seq(
      choice("let", "const", "set"),
      $.identifier,
      "=",
      $._expression
    ),

    function_definition: $ => seq(
      "fn",
      $.identifier,
      "(",
      optional($.identifier),
      ")",
      $.block
    ),

    block: $ => seq(
      "{",
      repeat($._definition),
      "}"
    ),

    function_call: $ => seq(
      $.identifier,
      "(",
      optional($._expression),
      ")",
    ),

    // conditionals
    if_stmt: $ => prec(1, seq(
      "if", 
      $._expression, 
      $.block, 
      optional($.else_stmt)
    )),
    
    else_stmt: $ => seq(
      "else",
      choice(
        $.block,
        $.if_stmt
      )
    ),
    match_stmt: $ => seq("match", $.identifier, $.block),
    
    // loops
    loops: $ => choice($.for_loop, $.while_loop),
    for_loop: $ => seq("for", $.identifier, "in", $._expression, $.block),
    while_loop: $ => seq("while", $._expression, $.block),

    // imports 
    import_stmt: $ => seq(
      "import",
      $.string,
      "as",
      $.identifier,
      optional(seq(
        "{",
        choice(
          $.import_list,
          "*",
        ),
        "}"
      )),
    ),

    import_list: $ => seq(
      $.identifier,
      repeat(seq(",", $.identifier)),
      optional(",") 
    ),

    // standalone keywords
    standalone_kw: $ => choice("return"),

    // data and values
    _expression: $ => choice(
      $.data_type,
      $.identifier,
      $.binary_expression
    ),
    binary_expression: $ => prec.left(seq(
      $._expression,
      "+",
      $._expression
    )),
    data_type: $ => choice(
      "true", 
      "false",
      "null",
      $.number,
      $.string,
    ),
    string: $ => seq(
      '"',
      /[^"\n]*/,
      '"'
    ),
    identifier: $ => /[a-zA-Z][a-zA-Z0-9_]*/,
    number: $ => /[0-9]+/
  }
});
