package tree_sitter_nbcl_test

import (
	"testing"

	tree_sitter "github.com/tree-sitter/go-tree-sitter"
	tree_sitter_nbcl "github.com/nbcl-lang/tree-sitter-nbcl/bindings/go"
)

func TestCanLoadGrammar(t *testing.T) {
	language := tree_sitter.NewLanguage(tree_sitter_nbcl.Language())
	if language == nil {
		t.Errorf("Error loading Nbcl grammar")
	}
}
