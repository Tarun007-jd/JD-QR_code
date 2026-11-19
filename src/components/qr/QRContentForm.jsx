import { useState } from 'react'
import { CircleAlert, Eye, EyeOff } from 'lucide-react'
import Input, { Textarea } from '../ui/Input'
import Select from '../ui/Select'
import { getQRType } from '../../data/qrTypes'

export default function QRContentForm({
  type,
  fields,
  errors = {},
  showErrors = false,
  onChange,
}) {
  const [touched, setTouched] = useState({})
  const [showPassword, setShowPassword] = useState(false)
  const typeMeta = getQRType(type)
  const TypeIcon = typeMeta.icon

  const value = (key) => fields?.[key] ?? ''
  const update = (key, nextValue) => onChange({ ...fields, [key]: nextValue })
  const markTouched = (key) => setTouched((previous) => ({ ...previous, [key]: true }))
  const fieldError = (key) =>
    showErrors || touched[key] ? errors[key] : ''

  return (
    <div>
      <div className="flex items-start gap-3 rounded-xl border border-line bg-surface-soft p-3.5">
        <span
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg tone-${typeMeta.tone}`}
        >
          <TypeIcon className="h-4 w-4" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="text-[0.8125rem] font-semibold text-ink">{typeMeta.title}</p>
          <p className="mt-0.5 text-xs leading-5 text-ink-soft">{typeMeta.description}</p>
        </div>
      </div>

      {showErrors && errors._form ? (
        <div className="callout callout-danger mt-4" role="alert">
          <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{errors._form}</span>
        </div>
      ) : null}

      <div className="mt-5 grid gap-4">
        {type === 'url' ? (
          <Input
            label="Website URL"
            required
            type="url"
            inputMode="url"
            autoComplete="url"
            placeholder="https://yourwebsite.com"
            value={value('url')}
            onChange={(event) => update('url', event.target.value)}
            onBlur={() => markTouched('url')}
            error={fieldError('url')}
            hint="We’ll add https:// automatically if you leave it out."
            spellCheck={false}
          />
        ) : null}

        {type === 'text' ? (
          <Textarea
            label="Text to encode"
            required
            rows={6}
            placeholder="Write a note, instructions, or any message…"
            value={value('text')}
            onChange={(event) => update('text', event.target.value)}
            onBlur={() => markTouched('text')}
            error={fieldError('text')}
            hint={`${value('text').length} / 900 characters`}
            maxLength={900}
          />
        ) : null}

        {type === 'wifi' ? (
          <>
            <Input
              label="Network name (SSID)"
              required
              placeholder="e.g. Studio Guest Wi-Fi"
              value={value('ssid')}
              onChange={(event) => update('ssid', event.target.value)}
              onBlur={() => markTouched('ssid')}
              error={fieldError('ssid')}
              autoComplete="off"
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <Select
                label="Security"
                value={value('security') || 'WPA'}
                onChange={(event) => update('security', event.target.value)}
                error={fieldError('security')}
              >
                <option value="WPA">WPA / WPA2 / WPA3</option>
                <option value="WEP">WEP</option>
                <option value="nopass">Open network</option>
              </Select>

              <Input
                label="Password"
                required={value('security') !== 'nopass'}
                type={showPassword ? 'text' : 'password'}
                placeholder={
                  value('security') === 'nopass' ? 'No password required' : 'Network password'
                }
                value={value('password')}
                onChange={(event) => update('password', event.target.value)}
                onBlur={() => markTouched('password')}
                error={fieldError('password')}
                autoComplete="new-password"
                disabled={value('security') === 'nopass'}
                trailing={
                  value('security') !== 'nopass' ? (
                    <button
                      type="button"
                      onClick={() => setShowPassword((current) => !current)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-faint transition-colors hover:bg-surface-muted hover:text-ink"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" aria-hidden="true" />
                      ) : (
                        <Eye className="h-4 w-4" aria-hidden="true" />
                      )}
                    </button>
                  ) : null
                }
              />
            </div>

            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-line bg-surface-soft p-3.5 transition-colors hover:border-line-strong">
              <input
                type="checkbox"
                checked={Boolean(fields.hidden)}
                onChange={(event) => update('hidden', event.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-line"
              />
              <span>
                <span className="block text-[0.8125rem] font-medium text-ink">
                  Hidden network
                </span>
                <span className="mt-0.5 block text-xs leading-5 text-ink-soft">
                  Enable this if the network does not broadcast its SSID.
                </span>
              </span>
            </label>
          </>
        ) : null}

        {type === 'email' ? (
          <>
            <Input
              label="Email address"
              required
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="hello@yourcompany.com"
              value={value('email')}
              onChange={(event) => update('email', event.target.value)}
              onBlur={() => markTouched('email')}
              error={fieldError('email')}
            />
            <Input
              label="Subject"
              optional
              placeholder="What is this about?"
              value={value('subject')}
              onChange={(event) => update('subject', event.target.value)}
              onBlur={() => markTouched('subject')}
              error={fieldError('subject')}
              maxLength={100}
            />
            <Textarea
              label="Message"
              optional
              rows={4}
              placeholder="Write a message that is ready to send…"
              value={value('body')}
              onChange={(event) => update('body', event.target.value)}
              onBlur={() => markTouched('body')}
              error={fieldError('body')}
              maxLength={600}
            />
          </>
        ) : null}

        {type === 'phone' ? (
          <Input
            label="Phone number"
            required
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="+91 98765 43210"
            value={value('phone')}
            onChange={(event) => update('phone', event.target.value)}
            onBlur={() => markTouched('phone')}
            error={fieldError('phone')}
            hint="Include the country code when the number is international."
          />
        ) : null}

        {type === 'sms' ? (
          <>
            <Input
              label="Phone number"
              required
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="+91 98765 43210"
              value={value('phone')}
              onChange={(event) => update('phone', event.target.value)}
              onBlur={() => markTouched('phone')}
              error={fieldError('phone')}
              hint="Include the country code when the number is international."
            />
            <Textarea
              label="Message"
              optional
              rows={4}
              placeholder="Pre-write a message…"
              value={value('message')}
              onChange={(event) => update('message', event.target.value)}
              onBlur={() => markTouched('message')}
              error={fieldError('message')}
              maxLength={400}
            />
          </>
        ) : null}

        {type === 'whatsapp' ? (
          <>
            <div className="grid gap-4 sm:grid-cols-[8rem_minmax(0,1fr)]">
              <Input
                label="Country code"
                required
                type="tel"
                inputMode="numeric"
                autoComplete="tel-country-code"
                placeholder="91"
                value={value('countryCode')}
                onChange={(event) =>
                  update(
                    'countryCode',
                    event.target.value.replace(/\D/g, '').slice(0, 4),
                  )
                }
                onBlur={() => markTouched('countryCode')}
                error={fieldError('countryCode')}
                leading={<span className="text-sm font-medium">+</span>}
                maxLength={4}
              />
              <Input
                label="WhatsApp number"
                required
                type="tel"
                inputMode="tel"
                autoComplete="tel-national"
                placeholder="98765 43210"
                value={value('phone')}
                onChange={(event) => update('phone', event.target.value)}
                onBlur={() => markTouched('phone')}
                error={fieldError('phone')}
                hint="Enter the local number without the country code."
                maxLength={20}
              />
            </div>
            <Textarea
              label="Pre-filled message"
              optional
              rows={4}
              placeholder="Hi! I’d like to know more about…"
              value={value('message')}
              onChange={(event) => update('message', event.target.value)}
              onBlur={() => markTouched('message')}
              error={fieldError('message')}
              maxLength={500}
            />
          </>
        ) : null}

        {type === 'vcard' ? (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Full name"
                required
                autoComplete="name"
                placeholder="Aarav Mehta"
                value={value('name')}
                onChange={(event) => update('name', event.target.value)}
                onBlur={() => markTouched('name')}
                error={fieldError('name')}
              />
              <Input
                label="Organization"
                optional
                autoComplete="organization"
                placeholder="Northstar Design"
                value={value('organization')}
                onChange={(event) => update('organization', event.target.value)}
                onBlur={() => markTouched('organization')}
                error={fieldError('organization')}
                maxLength={80}
              />
              <Input
                label="Job title"
                optional
                autoComplete="organization-title"
                placeholder="Design Director"
                value={value('jobTitle')}
                onChange={(event) => update('jobTitle', event.target.value)}
                onBlur={() => markTouched('jobTitle')}
                error={fieldError('jobTitle')}
                maxLength={80}
              />
              <Input
                label="Phone"
                optional
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder="+91 98765 43210"
                value={value('phone')}
                onChange={(event) => update('phone', event.target.value)}
                onBlur={() => markTouched('phone')}
                error={fieldError('phone')}
              />
              <Input
                label="Email"
                optional
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="you@company.com"
                value={value('email')}
                onChange={(event) => update('email', event.target.value)}
                onBlur={() => markTouched('email')}
                error={fieldError('email')}
              />
              <Input
                label="Website"
                optional
                type="url"
                inputMode="url"
                autoComplete="url"
                placeholder="https://yourwebsite.com"
                value={value('website')}
                onChange={(event) => update('website', event.target.value)}
                onBlur={() => markTouched('website')}
                error={fieldError('website')}
                containerClassName="sm:col-span-2"
                maxLength={200}
              />
            </div>
            <p className="text-xs leading-5 text-ink-faint">
              Add a phone number or email so contacts can reach you after scanning.
            </p>
          </>
        ) : null}

        {type === 'location' ? (
          <>
            <Input
              label="Location name"
              optional
              placeholder="QR Studio HQ"
              value={value('label')}
              onChange={(event) => update('label', event.target.value)}
              onBlur={() => markTouched('label')}
              error={fieldError('label')}
              hint="Shown as the pin label in Google Maps."
              maxLength={80}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Latitude"
                optional
                inputMode="decimal"
                placeholder="12.9716"
                value={value('latitude')}
                onChange={(event) => update('latitude', event.target.value)}
                onBlur={() => markTouched('latitude')}
                error={fieldError('latitude')}
              />
              <Input
                label="Longitude"
                optional
                inputMode="decimal"
                placeholder="77.5946"
                value={value('longitude')}
                onChange={(event) => update('longitude', event.target.value)}
                onBlur={() => markTouched('longitude')}
                error={fieldError('longitude')}
              />
            </div>

            <Textarea
              label="Address or place"
              optional
              rows={3}
              placeholder="221B Baker Street, London"
              value={value('address')}
              onChange={(event) => update('address', event.target.value)}
              onBlur={() => markTouched('address')}
              error={fieldError('address')}
              hint="Add an address, or enter both coordinates above. Scanning opens Google Maps."
              maxLength={300}
            />
          </>
        ) : null}

        {type === 'upi' ? (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="UPI ID"
                required
                placeholder="yourname@okhdfcbank"
                value={value('upiId')}
                onChange={(event) => update('upiId', event.target.value)}
                onBlur={() => markTouched('upiId')}
                error={fieldError('upiId')}
                autoCapitalize="none"
                spellCheck={false}
                containerClassName="sm:col-span-2"
              />
              <Input
                label="Payee name"
                required
                placeholder="QR Studio"
                value={value('payeeName')}
                onChange={(event) => update('payeeName', event.target.value)}
                onBlur={() => markTouched('payeeName')}
                error={fieldError('payeeName')}
                maxLength={80}
              />
              <Input
                label="Amount"
                optional
                inputMode="decimal"
                placeholder="Leave blank for any amount"
                value={value('amount')}
                onChange={(event) => update('amount', event.target.value)}
                onBlur={() => markTouched('amount')}
                error={fieldError('amount')}
                leading={<span className="text-sm font-medium">₹</span>}
              />
            </div>
            <Input
              label="Transaction note"
              optional
              placeholder="Studio order"
              value={value('note')}
              onChange={(event) => update('note', event.target.value)}
              onBlur={() => markTouched('note')}
              error={fieldError('note')}
              maxLength={50}
              hint="Up to 50 characters. Helps the payer recognise the payment."
            />
          </>
        ) : null}
      </div>
    </div>
  )
}
