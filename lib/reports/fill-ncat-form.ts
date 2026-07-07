import { PDFDocument } from 'pdf-lib'
import { readFileSync } from 'node:fs'
import path from 'node:path'

export type NcatApplicant = {
  fullName: string
  email: string
  phone: string
  postalAddress: string
}

export type NcatFillData = {
  propertyAddress: string
  rboNumber: string | null
  applicant: NcatApplicant
  agentName: string | null
  agentEmail: string | null
  ordersSought: string
  reasons: string
  signatureDate: string
}

export async function fillNcatForm(data: NcatFillData): Promise<Uint8Array> {
  const templatePath = path.join(
    process.cwd(),
    'lib/reports/templates/ncat-tenancy-application.pdf'
  )
  const templateBytes = readFileSync(templatePath)
  const pdfDoc = await PDFDocument.load(templateBytes)
  const form = pdfDoc.getForm()

  const setText = (name: string, value: string) => {
    try {
      form.getTextField(name).setText(value)
    } catch {
      // field not present in this form revision; skip rather than fail the whole document
    }
  }

  const selectRadio = (name: string, value: string) => {
    try {
      form.getRadioGroup(name).select(value)
    } catch {
      // option/field missing; leave unselected
    }
  }

  setText('RENTED PREMISES Address of rented premises', data.propertyAddress)
  selectRadio('Type of tenancy your application is about', 'Private tenancy')
  selectRadio('What is your dispute about', 'Rental bond')
  if (data.rboNumber) setText('Rental bond number', data.rboNumber)

  selectRadio('APPLICANT - Applicant type', 'Tenant')
  setText('APPLICANT First name', data.applicant.fullName)
  setText('APPLICANT Postal address', data.applicant.postalAddress)
  setText('APPLICANT phone number', data.applicant.phone)
  setText('APPLICANT Email', data.applicant.email)

  selectRadio('RESPONDENT Respondent type', 'Landlord')
  if (data.agentName) setText('RESPONDENT Organisation name (if applicable)', data.agentName)
  if (data.agentEmail) setText('RESPONDENT Email', data.agentEmail)

  setText('ORDER DETAILS What orders do you want?', data.ordersSought)
  setText('ORDER DETAILS What are your reasons for asking for the orders', data.reasons)
  selectRadio('HEARING Do you require an interpreter', 'No')

  setText('SIGNATURE Name', data.applicant.fullName)
  setText('SIGNATURE Date', data.signatureDate)

  return pdfDoc.save()
}
