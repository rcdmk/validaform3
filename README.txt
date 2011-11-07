This is a project for client-side javascript validation of form data
based on data attributes using jQuery 1.6+ to interface the DOM.

The intent of this project is to provide a easy to use validation
kit that webdesigners can use without any programming knowledge.
A non obstrusive way to validate your forms without mixing markup
and scripts.


**How to use:

- Insert the script in the page:
	<script src="js/rcdmk-validaform3.js"></script>
	
- Add the attribute "data-validaform" to the form tag:
	<form data-validaform="true">
	
- Add the attributes to the fields
	<input data-vf-req="true" ...