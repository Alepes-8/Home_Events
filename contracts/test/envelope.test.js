import ajv202 from "ajv/dist/2020";
import addFormats from "ajv-formats";
import { readFileSync } from "fs";
import path from "path";

// Load the JSON schema for the envelope
const schemaPath = path.join(__dirname, "../schemas/envelope.schema.json");
const schema = JSON.parse(readFileSync(schemaPath, "utf-8"));

const ajv = new ajv202({  
    allErrors: true,
    strict: false 
});
addFormats(ajv);


function formatErrors(errors) {
  if (!errors?.length) return 'unknown schema validation error';
  return errors
    .map((error) => {
    const path = error.instancePath || '/';
    return `${path}: ${error.message ?? error.keyword}`;
    })
    .join('\n');
}

// Compile a JSON schema into a validator function
export function compileResponseValidator(schema) {
  const validate = ajv.compile(schema);  // Compile the schema into a validation function
  return (body) => { // Return a function that validates the response body against the schema
    if (!validate(body)) {  // If the validation fails, throw an error with the validation errors
      throw new Error(`Response violated JSON Schema:\n${formatErrors(validate.errors)}`); // Format the validation errors into a string
    }
    return body;
  };
}