export const CONTACT_FORM_ENDPOINT = 'https://formspree.io/f/xojgvvjv'

export async function submitContactForm(formData) {
  const response = await fetch(CONTACT_FORM_ENDPOINT, {
    method: 'POST',
    body: formData,
    headers: { Accept: 'application/json' },
  })

  if (!response.ok) throw new Error('Formspree rejected the submission')
  return response
}
