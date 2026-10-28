// Basic Flutter widget test.
import 'package:flutter_test/flutter_test.dart';
import 'package:cchat_ecommerce/app/app.dart';

void main() {
  testWidgets('App should render without errors', (WidgetTester tester) async {
    // Build our app and trigger a frame.
    await tester.pumpWidget(const App());

    // Verify that the app renders
    expect(find.byType(App), findsOneWidget);
  });
}
