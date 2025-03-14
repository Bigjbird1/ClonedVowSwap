# Wedding Details Form Component

The Wedding Details Form component is a comprehensive form for collecting wedding-specific details for listings in the VowSwap marketplace. It provides a user-friendly interface for entering information about wedding items, including category, condition, price, measurements, style, and color.

## Component Structure

The Wedding Details Form is composed of several subcomponents:

```
WeddingDetailsForm
├── CategorySelect
├── ConditionSelect
├── PriceInputs
├── MeasurementsForm
└── StyleAndColorInputs
```

## Main Component: WeddingDetailsForm

The main component orchestrates the form state and validation, and composes the subcomponents.

### Props

- `initialValues`: (Optional) Initial values for the form fields
- `onSubmit`: Callback function that receives the form data when the form is submitted
- `onCancel`: (Optional) Callback function that is called when the cancel button is clicked

### Usage

```tsx
import WeddingDetailsForm from "../Components/MainComponents/WeddingDetails/WeddingDetailsForm";

// In your component:
const handleSubmit = (data) => {
  // Process form data
  console.log(data);
};

return <WeddingDetailsForm onSubmit={handleSubmit} />;
```

## Subcomponents

### CategorySelect

Provides a dropdown for selecting the wedding item category.

#### Props

- `value`: The currently selected category
- `onChange`: Callback function that receives the new category when changed
- `error`: (Optional) Error message to display

### ConditionSelect

Provides radio buttons for selecting the condition of the wedding item.

#### Props

- `value`: The currently selected condition
- `onChange`: Callback function that receives the new condition when changed
- `error`: (Optional) Error message to display

### PriceInputs

Provides input fields for entering the current price and original retail price of the wedding item.

#### Props

- `price`: The current price value
- `onPriceChange`: Callback function that receives the new price when changed
- `originalRetailPrice`: The original retail price value
- `onOriginalRetailPriceChange`: Callback function that receives the new original retail price when changed
- `priceError`: (Optional) Error message to display for the price field
- `originalRetailPriceError`: (Optional) Error message to display for the original retail price field

### MeasurementsForm

Provides dynamic input fields for entering measurements based on the selected category.

#### Props

- `category`: The selected wedding category
- `template`: The measurement template for the selected category
- `measurements`: The current measurements values
- `onChange`: Callback function that receives the new measurements when changed
- `errors`: Record of error messages for measurement fields
- `isLoading`: Boolean indicating if the measurement template is loading

### StyleAndColorInputs

Provides input fields for adding style tags and colors to the wedding item.

#### Props

- `style`: Array of current style tags
- `onStyleChange`: Callback function that receives the new style tags when changed
- `color`: Array of current color tags
- `onColorChange`: Callback function that receives the new color tags when changed
- `category`: (Optional) The selected wedding category for suggesting relevant styles

## Form Validation

The form validates the following:

- Category is required
- Condition is required
- Price is required and must be greater than 0
- Original retail price must be greater than 0 if provided
- Original retail price must be greater than or equal to the current price if both are provided
- Required measurements based on the selected category

## Example

An example implementation of the Wedding Details Form can be found at:

```
/src/app/examples/wedding-details-form/page.tsx
```

This example demonstrates how to use the form, handle form submission, and display the submitted data.

## Testing

Unit tests for the Wedding Details Form and its subcomponents can be found at:

```
/tests/components/WeddingDetailsForm.test.tsx
```

These tests cover rendering, validation, and interaction with the form components.

## Styling

The Wedding Details Form uses Tailwind CSS for styling. The components are designed to be responsive and accessible.

## Future Enhancements

Potential future enhancements for the Wedding Details Form include:

- Integration with image upload for measurement diagrams
- Support for additional measurement units
- Advanced validation for measurements based on category-specific requirements
- Integration with a color picker for more precise color selection
- Support for custom measurement fields
