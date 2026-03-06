import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import type { Car, ServiceRecord, CarOwnershipHistory } from '@/lib/db/schema'

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 9,
    padding: 40,
    color: '#111',
  },
  header: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingBottom: 14,
  },
  carTitle: {
    fontSize: 20,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 3,
  },
  carMeta: {
    fontSize: 9,
    color: '#6b7280',
    marginBottom: 2,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 18,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#f9fafb',
    borderRadius: 6,
    padding: 10,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 13,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 8,
    color: '#6b7280',
  },
  section: {
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 8,
    color: '#374151',
  },
  ownerRow: {
    fontSize: 8,
    color: '#6b7280',
    marginBottom: 3,
  },
  ownerName: {
    fontFamily: 'Helvetica-Bold',
    color: '#111',
  },
  table: {
    width: '100%',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    borderRadius: 4,
    paddingVertical: 5,
    paddingHorizontal: 6,
    marginBottom: 2,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 5,
    paddingHorizontal: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  tableRowAlt: {
    backgroundColor: '#fafafa',
  },
  colDate: { width: '11%' },
  colMileage: { width: '10%' },
  colType: { width: '17%' },
  colDesc: { width: '48%' },
  colCost: { width: '14%', textAlign: 'right' },
  thText: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: '#6b7280',
  },
  tdText: {
    fontSize: 8,
    color: '#111',
  },
  footer: {
    position: 'absolute',
    bottom: 28,
    left: 40,
    right: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 6,
  },
  footerText: {
    fontSize: 7,
    color: '#9ca3af',
  },
})

function fmt(n: number) {
  return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}

function fmtDate(d: Date | string) {
  return new Date(d).toLocaleDateString('uk-UA')
}

type Props = {
  car: Car
  records: ServiceRecord[]
  ownershipHistory: CarOwnershipHistory[]
  totalCost: number
  currentKm: number | null
}

export default function CarServicePdf({ car, records, ownershipHistory, totalCost, currentKm }: Props) {
  const ownerCount = ownershipHistory.length > 0 ? ownershipHistory.length : 1

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.carTitle}>{car.make} {car.model} {car.year}</Text>
          {car.licensePlate && <Text style={styles.carMeta}>Plate: {car.licensePlate.toUpperCase()}</Text>}
          {car.vin && <Text style={styles.carMeta}>VIN: {car.vin.toUpperCase()}</Text>}
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{records.length}</Text>
            <Text style={styles.statLabel}>service records</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{totalCost > 0 ? `${fmt(totalCost)} UAH` : '—'}</Text>
            <Text style={styles.statLabel}>total spent</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{currentKm ? `${fmt(currentKm)} km` : '—'}</Text>
            <Text style={styles.statLabel}>current mileage</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{ownerCount}</Text>
            <Text style={styles.statLabel}>{ownerCount === 1 ? 'owner' : 'owners'}</Text>
          </View>
        </View>

        {/* Ownership history */}
        {ownershipHistory.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ownership History</Text>
            {ownershipHistory.map((entry) => (
              <Text key={entry.id} style={styles.ownerRow}>
                <Text style={styles.ownerName}>{entry.ownerName}</Text>
                {'  '}
                {fmtDate(entry.ownedFrom)}
                {entry.ownedTo ? ` → ${fmtDate(entry.ownedTo)}` : ' → present'}
              </Text>
            ))}
          </View>
        )}

        {/* Records table */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Service History</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <View style={styles.colDate}><Text style={styles.thText}>Date</Text></View>
              <View style={styles.colMileage}><Text style={styles.thText}>Km</Text></View>
              <View style={styles.colType}><Text style={styles.thText}>Type</Text></View>
              <View style={styles.colDesc}><Text style={styles.thText}>Description</Text></View>
              <View style={styles.colCost}><Text style={styles.thText}>Cost</Text></View>
            </View>
            {records.map((r, i) => (
              <View key={r.id} style={[styles.tableRow, i % 2 === 1 ? styles.tableRowAlt : {}]}>
                <View style={styles.colDate}><Text style={styles.tdText}>{fmtDate(r.date)}</Text></View>
                <View style={styles.colMileage}><Text style={styles.tdText}>{fmt(r.mileage)}</Text></View>
                <View style={styles.colType}><Text style={styles.tdText}>{r.type}</Text></View>
                <View style={styles.colDesc}><Text style={styles.tdText}>{r.description}</Text></View>
                <View style={styles.colCost}>
                  <Text style={styles.tdText}>{r.cost ? fmt(Number(r.cost)) : '—'}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>Car Service Book</Text>
          <Text style={styles.footerText}>Generated {fmtDate(new Date())}</Text>
          <Text style={styles.footerText} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
        </View>
      </Page>
    </Document>
  )
}
